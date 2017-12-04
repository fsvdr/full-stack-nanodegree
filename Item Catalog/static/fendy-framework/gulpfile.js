var gulp = require('gulp');
var autoprefixer = require('autoprefixer');
var mqpacker = require('css-mqpacker');
var postcss = require('gulp-postcss');
var sass = require('gulp-sass');
var reporter = require('postcss-reporter');




/**
 * Stylesheets linting
 * Lints every sass file during development
 */
gulp.task('scss-lint', function() {
  var stylelint = require('stylelint');
  var scss = require("postcss-scss");

  var processors = [
    stylelint(),
    reporter({
      clearMessages: true
    })
  ];

  return gulp
    .src(['./**/*.scss', '!**/node_modules/**'])
    .pipe(postcss(processors, {syntax: scss}));
});

/**
 * Builds single css file
 * Runs 'scss-lint' before compiling sass to css and creating it's corresponding
 * sourcemap
 */
gulp.task('build-css', ['scss-lint'], function() {
  var sourcemaps   = require('gulp-sourcemaps');

  var sassOptions = {
    errLogToConsole: true,
    outputStyle: 'expanded'
  };

  var processors = [
    autoprefixer(),
    reporter({
      clearMessages: true
    }),
    mqpacker()
  ];

  return gulp
    .src('main.scss')
    .pipe(sourcemaps.init())
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(postcss(processors))
    .pipe(sourcemaps.write('../'))
    .pipe(gulp.dest('../'))
});

/**
 * Watches for changes in sass files
 * Runs 'build-css' every time a sass file is changed
 */
gulp.task('watch', function() {
  return gulp
    .watch(['./**/*.scss', '!**/node_modules/**'], ['build-css'])
    .on('change', function(event) {
      console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    })
});

/**
 * Builds production-ready files
 * Generates compressed and prefixed css without sourcemaps
 */
gulp.task('prod', function () {

	var sassOptions = {
    errLogToConsole: true,
    outputStyle: 'compressed'
  };

  var processors = [
    autoprefixer(),
    reporter({
      clearMessages: true
    }),
    mqpacker()
  ];

  return gulp
    .src('main.scss')
		.pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(postcss(processors))
    .pipe(gulp.dest('../'));
});

/**
 * Declare default tasks to run
 * Running 'gulp' in terminal will run first 'build-css' and then will run
 * 'watch'
 */
gulp.task('default', ['build-css', 'watch']);
