$(document).ready(function () {
  $(document).on('click', documentEvent => {
    let target = $(documentEvent.target)
    let featureParent = target.closest('.feature-row')
    if (featureParent.length) {
      if (featureParent.hasClass('open')) {
        featureParent.removeClass('open')
      }
      else {
        $('.feature-row').removeClass('open')
        featureParent.addClass('open')
      }
    }
    else {
      $('.feature-row').removeClass('open')
    }
  })
})