;(function(doc) {
  if (!('geolocation' in navigator)) {
    return;
  }

  var classes = [];

  if (sessionStorage.webfontStageOne && sessionStorage.webfontStageTwo) {
    classes.push('webfont-stage-2');
  }

  document.documentElement.className += " " + classes.join(" ");
})(document);
