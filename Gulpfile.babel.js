'use strict';

import {argv} from 'yargs';
import autoprefixer from 'autoprefixer';
import del from 'del';
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import shell from 'shelljs';

const $ = gulpLoadPlugins();
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;

gulp.task('assets:copy', () =>
  gulp.src('.tmp/assets/**/*')
    .pipe(gulp.dest('dist/assets'))
);

gulp.task('clean:assets', () => {
  return del([
    '.tmp/**/*',
    '!.tmp/assets',
    '!.tmp/assets/images',
    '!.tmp/assets/images/**/*',
    'dist/assets'
  ]);
});

gulp.task('clean:dist', () => {
  return del(['dist/']);
});

gulp.task('clean:gzip', () => {
  return del(['dist/**/*.gz']);
});

gulp.task('clean:images', () => {
  return del([
    '.tmp/assets/images',
    'dist/assets/images'
  ]);
});

gulp.task('clean:metadata', () => {
  return del(['src/.jekyll-metadata']);
});

gulp.task('deploy', () => {
  return gulp.src('dist/**/*')
    .pipe($.ghPages());
});

gulp.task('fonts', () =>
  gulp.src('src/assets/fonts/**/*')
    .pipe(gulp.dest('.tmp/assets/fonts'))
    .pipe($.size({title: 'fonts'}))
);

gulp.task('html', () =>
  gulp.src('dist/**/*.html')
    .pipe($.if(argv.prod, $.htmlmin({
      removeComments: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeAttributeQuotes: true,
      removeRedundantAttributes: true
    })))
    .pipe($.if(argv.prod, $.size({title: 'optimized HTML'})))
    .pipe($.if(argv.prod, gulp.dest('dist')))
    .pipe($.if(argv.prod, $.gzip({append: true})))
    .pipe($.if(argv.prod, $.size({
      title: 'gzipped HTML',
      gzip: true
    })))
    .pipe($.if(argv.prod, gulp.dest('dist')))
);

gulp.task('images', () =>
  gulp.src('src/assets/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('.tmp/assets/images'))
    .pipe($.size({title: 'images'}))
);

gulp.task('inject:head', () =>
  gulp.src('src/_includes/head.html')
    .pipe($.inject(
      gulp.src('.tmp/assets/stylesheets/*.css', {read: false}),
      {ignorePath: '.tmp'}
    ))
    .pipe(gulp.dest('src/_includes'))
);

gulp.task('inject:footer', () =>
  gulp.src('src/_layouts/default.html')
    .pipe($.inject(
      gulp.src('.tmp/assets/javascript/*.js', {read: false}),
      {ignorePath: '.tmp'}
    ))
    .pipe(gulp.dest('src/_layouts'))
);

gulp.task('inject:svgs', () => {
  var svgs = gulp.src('src/_icons/icon-*.svg')
    .pipe($.svgstore({
      inlineSvg: true
    }));

  function fileContents(_filePath, file) {
    return file.contents.toString();
  }

  return gulp.src('src/_includes/icons.html')
    .pipe($.inject(svgs, {transform: fileContents}))
    .pipe(gulp.dest('src/_includes'));
});

gulp.task('jekyll', done => {
  if (!argv.prod) {
    shell.exec('bundle exec jekyll build');
    done();
  } else if (argv.prod) {
    shell.exec('bundle exec jekyll build --config _config.yml,_config.prod.yml');
    done();
  }
});

gulp.task('jekyll:doctor', done => {
  shell.exec('bundle exec jekyll doctor');
  done();
});

gulp.task('lint', () =>
  gulp.src([
    'Gulpfile.babel.js',
    '.tmp/assets/javascript/*.js',
    '!.tmp/assets/javascript/*.min.js'
  ])
  .pipe($.eslint())
  .pipe($.eslint.formatEach())
  .pipe($.eslint.failOnError())
);

gulp.task('rebuild', gulp.series(
  'clean:dist',
  'clean:assets',
  'clean:images',
  'clean:metadata'
));

gulp.task('scripts', () =>
  gulp.src([
    'src/assets/javascript/vendor.js',
    'src/assets/javascript/main.js',
    'src/assets/javascript/fonts.js',
  ])
    .pipe($.newer('.tmp/assets/javascript/index.js', {dest: '.tmp/assets/javascript', ext: '.js'}))
    .pipe($.if(!argv.prod, $.sourcemaps.init()))
    .pipe($.concat('index.js'))
    .pipe($.size({
      title: 'scripts',
      showFiles: true
    }))
    .pipe($.if(argv.prod, $.rename({suffix: '.min'})))
    .pipe($.if(argv.prod, $.if('*.js', $.uglify({preserveComments: 'some'}))))
    .pipe($.if(argv.prod, $.size({
      title: 'minified scripts',
      showFiles: true
    })))
    .pipe($.if(argv.prod, $.rev()))
    .pipe($.if(!argv.prod, $.sourcemaps.write('.')))
    .pipe($.if(argv.prod, gulp.dest('.tmp/assets/javascript')))
    .pipe($.if(argv.prod, $.if('*.js', $.gzip({append: true}))))
    .pipe($.if(argv.prod, $.size({
      title: 'gzipped scripts',
      gzip: true,
      showFiles: true
    })))
    .pipe(gulp.dest('.tmp/assets/javascript'))
    .pipe($.if(!argv.prod, browserSync.stream({match: '**/*.js'})))
);

gulp.task('serve', () => {
  browserSync.init({
    // tunnel: true,
    // open: false,
    server: ['.tmp', 'dist']
  });

  gulp.watch(['src/**/*.md', 'src/**/*.html', '**/*.yml'], gulp.series('jekyll', reload));
  gulp.watch(['src/**/*.xml', 'src/**/*.txt'], gulp.series('jekyll'));
  gulp.watch('src/assets/javascript/**/*.js', gulp.series('scripts'));
  gulp.watch('src/assets/scss/**/*.scss', gulp.series('styles'));
  gulp.watch('src/assets/images/**/*', reload);
  gulp.watch('src/_icons/**/*.svg', gulp.series('inject:svgs'));
});

gulp.task('styles', () =>
  gulp.src('src/assets/scss/main.scss')
    .pipe($.if(!argv.prod, $.sourcemaps.init()))
    .pipe($.sass({
      precision: 10
    }).on('error', $.sass.logError))
    .pipe($.postcss([
      autoprefixer({browsers: 'last 1 version'})
    ]))
    .pipe($.size({
      title: 'styles',
      showFiles: true
    }))
    .pipe($.if(argv.prod, $.rename({suffix: '.min'})))
    .pipe($.if(argv.prod, $.if('*.css', $.cssnano({autoprefixer: false}))))
    .pipe($.if(argv.prod, $.size({
      title: 'minified styles',
      showFiles: true
    })))
    .pipe($.if(argv.prod, $.rev()))
    .pipe($.if(!argv.prod, $.sourcemaps.write('.')))
    .pipe($.if(argv.prod, gulp.dest('.tmp/assets/stylesheets')))
    .pipe($.if(argv.prod, $.if('*.css', $.gzip({append: true}))))
    .pipe($.if(argv.prod, $.size({
      title: 'gzipped styles',
      gzip: true,
      showFiles: true
    })))
    .pipe(gulp.dest('.tmp/assets/stylesheets'))
    .pipe($.if(!argv.prod, browserSync.stream({match: '**/*.css'})))
);

gulp.task('check', gulp.series('jekyll:doctor', 'lint'));
gulp.task('clean', gulp.series('clean:assets', 'clean:gzip'));

gulp.task('assets', gulp.series(
  gulp.series('clean:assets'),
  gulp.parallel('styles', 'scripts', 'fonts', 'images')
));

gulp.task('build', gulp.series(
  gulp.series('clean:assets', 'clean:gzip'),
  gulp.series('assets', 'inject:head', 'inject:footer', 'inject:svgs'),
  gulp.series('jekyll', 'assets:copy', 'html')
));

gulp.task('default', gulp.series(
  gulp.series('clean:assets', 'clean:gzip'),
  gulp.series('assets', 'inject:head', 'inject:footer', 'inject:svgs'),
  gulp.series('jekyll', 'assets:copy', 'html'),
  gulp.series('serve')
));
