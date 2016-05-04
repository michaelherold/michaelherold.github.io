;(function(doc) {
  if (!('geolocation' in navigator) || !('keys' in Object) || sessionStorage.webfontStageOne && sessionStorage.webfontStageTwo) {
    return;
  }

  var documentElement = document.documentElement;

  FontFaceOnload(
    'NotoSansSubset',
    {
      success: function() {
        documentElement.className += " webfont-stage-1";
        sessionStorage.webfontStageOne = true;

        var counter = 0;
        var name;
        var param;
        var stage2 = {
          NotoSans: {},
          NotoSansBold: {
            weight: 700,
          },
          NotoSansItalic: {
            style: 'italic',
          },
          NotoSansBoldItalic: {
            weight: 700,
            style: 'italic',
          },
        };
        var numberOfFonts = Object.keys(stage2).length;

        var success = function() {
          counter++;

          if (counter == numberOfFonts) {
            documentElement.className += " webfont-stage-2";
            sessionStorage.webfontStageTwo = true;
          }
        };

        for (name in stage2) {
          param = stage2[name];
          param.success = success;
          FontFaceOnload(name, param);
        }
      },
    }
  );
})(document);
