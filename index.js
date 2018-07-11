var express = require('express');
var path = require('path');
var sassMiddleware = require('node-sass-middleware');
var livereload = require('express-livereload');
var rev = require('express-rev');

// routes
var index = require('./routes/index');
var tavern = require('./routes/tavern');

var app = express();
app.set('port', (process.env.PORT || 5000));


// .pipe(revReplace({manifest: cssManifest}))
// .pipe(revReplace({manifest: imageManifest}))
// .pipe(revReplace({manifest: jsManifest}))
// .pipe(revReplace({manifest: jsVendorManifest}))

// var cssManifest = gulp.src(config.cssDir + "/rev-manifest.json");
//   var imageManifest = gulp.src(config.imageAssetDir + "/rev-manifest.json");
//   var jsManifest = gulp.src(config.jsAssetDir + "/rev-manifest.json");
//   var jsVendorManifest = gulp.src(config.jsAssetVendorDir + "/rev-manifest.json");



// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// app.use(rev({
//   manifest: './site/assets/images/rev-manifest.json',
//   prepend: 'assets'
// }));
app.set('view engine', 'html');
app.use('/', express.static('site'));


// app.use(sassMiddleware({
//   src: path.join(__dirname, 'assets/styles'),
//   dest: path.join(__dirname, 'assets/styles'),
//   indentedSyntax: true, // true = .sass and false = .scss
//   sourceMap: true
// }));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/site/index.html');
});
app.get('/tavern', function (req, res) {
  res.sendFile(__dirname + '/site/tavern.html');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(app.get('port'));

module.exports = app;
