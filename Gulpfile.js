var gulp = require('gulp');
var $    = require('gulp-load-plugins')();

gulp.task('img:svgstore', [], function() {
  var svgs = gulp.src('_img/icon-*.svg')
    .pipe($.svgstore({
      inlineSvg: true,
    }));

  function fileContents(_filePath, file) {
    return file.contents.toString();
  }

  return gulp.src('_includes/icons.html')
    .pipe($.inject(svgs, {transform: fileContents}))
    .pipe(gulp.dest('_includes'));
});
