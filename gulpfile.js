var gulp = require('gulp');
var gulpLess = require('gulp-less');
var gulpReplace = require('gulp-replace');
var rimraf = require('rimraf');
var cleanCss =require('gulp-clean-css');
var exec = require('child_process').exec;
var runSequece = require('run-sequence');
var inlineResources = require('./scripts/inline-resources');
var path = require('path');

var styleUrlsPattern = /styleUrls:\s*\[\s*'([^\[\]]+?)\.less'\s*]/g;

gulp.task('clean', function () {
    rimraf.sync('aot');
    rimraf.sync('dist');
});

gulp.task('replace-less-url', function() {
    return gulp.src('src/**/*.ts')
        .pipe(gulpReplace(styleUrlsPattern, 'styleUrls: [\'$1.css\']'))
        .pipe(gulp.dest('aot'));
});

gulp.task('copy-assets', function() {
    return gulp.src(['src/tsconfig-aot.json', 'src/**/*.less', 'src/**/*.html'])
        .pipe(gulp.dest('dist'))
        .pipe(gulp.dest('aot'));
});

gulp.task('less', function () {
    return gulp.src('src/**/*.less')
        .pipe(gulpLess())
        .pipe(cleanCss())
        .pipe(gulp.dest('dist'));
});

gulp.task('compile', function(done) {
    exec('$(npm bin)/ngc -p aot/tsconfig-aot.json', done);
});

gulp.task('inline-resources', function () {
    return inlineResources(path.join(__dirname, 'dist'));
});

gulp.task('cleanup', function() {
    rimraf.sync('aot');
});

gulp.task('build', function (done) {
    runSequece(
        'clean',
        'replace-less-url',
        'copy-assets',
        'less',
        'compile',
        'inline-resources',
        'cleanup',
        done);
});
