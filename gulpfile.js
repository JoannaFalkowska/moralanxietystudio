
/*global require*/
"use strict";

var gulp = require('gulp'),
  path = require('path'),
  util = require('gulp-util'),
  data = require('gulp-data'),
  jade = require('gulp-jade'),
  prefix = require('gulp-autoprefixer'),
  rev = require('gulp-rev'),
  revReplace = require('gulp-rev-replace'),
  sass = require('gulp-sass'),
  cleanCSS = require('gulp-clean-css'),
  uglify = require('gulp-uglify'),
  babel = require('gulp-babel'),
  concat = require('gulp-concat'),
  connect = require('gulp-connect'),
  pump = require('pump'),
  del = require('del'),
  browserSync = require('browser-sync');

/*
* Change directories here
*/
var config = {
  publicDir: 'site',

  sassDir: 'assets/styles',
  cssDir: 'site/assets/styles',

  imageDir: 'assets/images',
  
  jsDir: 'assets/scripts',
  jsAssetDir: 'site/assets/scripts',
  jsAssetVendorDir: 'site/assets/scripts/vendor',

  imageAssetDir: 'site/assets/images',
  
  faviconDir: 'assets/favicons',
  
  filesDir: 'assets/files',
  filesTargetDir: 'site/public',

  presskitDir: 'presskit',
  presskitTargetDir: 'site/presskit',

  production: !!util.env.production,
};

/**
 * Wait for jade and sass tasks, then launch the browser-sync Server
 */
gulp.task('browser-sync', ['browser-sync-reload', 'favicons', 'files'], function () {
  browserSync({
    server: {
      baseDir: config.publicDir
    },
    reloadDelay: 5000,
  });
});

gulp.task('browser-sync-reload', ['jade', 'html-replace', 'sass', 'css-replace', 'presskit', 'presskit-replace'], function () {
  browserSync.reload()
});

gulp.task('clean', function () {
  return del('publicDir/**', { force: true });
});


// Compile .jade files
gulp.task('jade', function () {
  return gulp.src('*.jade')
    .pipe(jade())
    .pipe(gulp.dest(config.publicDir))
});

gulp.task('html-replace', ['jade', 'sass', 'images', 'javascript', 'vendor'], function () {
  var cssManifest = gulp.src(config.cssDir + "/rev-manifest.json");
  var imageManifest = gulp.src(config.imageAssetDir + "/rev-manifest.json");
  var jsManifest = gulp.src(config.jsAssetDir + "/rev-manifest.json");
  var jsVendorManifest = gulp.src(config.jsAssetVendorDir + "/rev-manifest.json");
  return gulp.src(config.publicDir + "/*.html")
    .pipe(revReplace({manifest: cssManifest}))
    .pipe(revReplace({manifest: imageManifest}))
    .pipe(revReplace({manifest: jsManifest}))
    .pipe(revReplace({manifest: jsVendorManifest}))
    .pipe(gulp.dest(config.publicDir))
    .pipe(browserSync.reload({stream: true}));
});

// Compile .scss files into public css directory with autoprefixer
gulp.task('sass', ['css-clean'], function () {
  return gulp.src([config.sassDir + '/*.sass', '!/_*.sass'])
    .pipe(sass({
      includePaths: [config.sassDir],
      outputStyle: 'compressed'
    }))
    .on('error', sass.logError)
    .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {cascade: true}))
    .pipe(cleanCSS())
    .pipe(rev())
    .pipe(gulp.dest(config.cssDir))
    .pipe(rev.manifest())
    .pipe(gulp.dest(config.cssDir))
});

gulp.task('css-replace', ['sass', 'images'], function () {
  var imageManifest = gulp.src(config.imageAssetDir + "/rev-manifest.json");
  return gulp.src(config.cssDir + "/*.css")
    .pipe(revReplace({manifest: imageManifest}))
    .pipe(gulp.dest(config.cssDir))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('css-clean', function () {
  return del([config.cssDir])
});


gulp.task('javascript', function (cb) {
  pump([
      gulp.src(config.jsDir + '/*.js'),
      babel({
        presets: ["babel-preset-es2015"]
      }),
      uglify(),
      concat('application.js'),
      rev(),
      gulp.dest(config.jsAssetDir),
      rev.manifest(),
      gulp.dest(config.jsAssetDir)
    ],
    cb
  );
});

gulp.task('vendor', function() {
  var files = [
    'assets/scripts/vendor/*.js',
    'bower_components/scrollmagic/scrollmagic/uncompressed/ScrollMagic.js',
    'bower_components/selectize/dist/js/standalone/selectize.js',
    'node_modules/verge/verge.js',
  ]

  return gulp.src(files)
    .pipe(concat('vendor.js'))
    // .pipe(uglify())
    .pipe(rev())
    .pipe(gulp.dest(config.jsAssetVendorDir))
    .pipe(rev.manifest())
    .pipe(gulp.dest(config.jsAssetVendorDir))
});


// "Compile" images (add hash to filename)
gulp.task('images', function() {
  return gulp.src([config.imageDir + '/**'])
    .pipe(rev())
    .pipe(gulp.dest(config.imageAssetDir))
    .pipe(rev.manifest())
    .pipe(gulp.dest(config.imageAssetDir))
})

gulp.task('favicons', function() {
  return gulp.src(config.faviconDir + '/**')
    .pipe(gulp.dest(config.publicDir))
})

gulp.task('files', function() {
  return gulp.src([config.filesDir + '/**'])
    .pipe(gulp.dest(config.filesTargetDir))
})


// Move all presskit files into appropriate folder without doing anything to them - just revreplace
gulp.task('presskit', function() {
  return gulp.src([config.presskitDir + '/**'])
    .pipe(gulp.dest(config.presskitTargetDir))
})

gulp.task('presskit-replace', ['presskit', 'images'], function () {
  var imageManifest = gulp.src(config.imageAssetDir + "/rev-manifest.json");
  return gulp.src([config.presskitTargetDir + "/*.css", config.presskitTargetDir + "/*.html"])
    .pipe(revReplace({ manifest: imageManifest }))
    .pipe(gulp.dest(config.presskitTargetDir))
    .pipe(browserSync.reload({ stream: true }));
})


/**
 * Watch scss files for changes & recompile
 * Watch .jade files run jade-rebuild then reload BrowserSync
 */
gulp.task('watch', ['browser-sync'], function () {
  gulp.watch(config.sassDir + '/**', ['browser-sync-reload']);
  gulp.watch(config.imageDir + '/**', ['browser-sync-reload']);
  gulp.watch(config.jsDir + '/**', ['browser-sync-reload']);
  gulp.watch(config.presskitDir + '/**', ['browser-sync-reload']);
  gulp.watch(['*.jade', '**/*.jade'], ['browser-sync-reload']);
});

/**
 * Default task, running just `gulp` will compile the sass and jade,
 * revision asset files, launch BrowserSync then watch
 * files for changes
 */

gulp.task('default', ['browser-sync', 'watch']);
gulp.task('buildproduction', ['clean', 'jade', 'html-replace', 'sass', 'css-replace', 'presskit', 'presskit-replace', 'javascript', 'favicons', 'files']);

gulp.task('serveproduction', function() {
  connect.server({
    root: [config.publicDir],
    port: process.env.PORT || 5000, // localhost:5000
    livereload: false
  });
});