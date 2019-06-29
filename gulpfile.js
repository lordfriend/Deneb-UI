const { series, src, dest } = require('gulp');
const gulpLess = require('gulp-less');
const gulpReplace = require('gulp-replace');
const rimraf = require('rimraf');
const cleanCss =require('gulp-clean-css');
const exec = require('child_process').exec;
const inlineResources = require('./scripts/inline-resources');
const path = require('path');

var styleUrlsPattern = /styleUrls:\s*\[\s*'([^\[\]]+?)\.less'\s*]/g;

function clean(done) {
    rimraf.sync('aot');
    rimraf.sync('dist');
    done();
}

function replaceLessUrl() {
    return src('src/**/*.ts')
        .pipe(gulpReplace(styleUrlsPattern, 'styleUrls: [\'$1.css\']'))
        .pipe(dest('aot'));
}

function copyAssets() {
    return src(['src/tsconfig-aot.json', 'src/**/*.less', 'src/**/*.html'])
        .pipe(dest('dist'))
        .pipe(dest('aot'));
}

function less() {
    return src('src/**/*.less')
        .pipe(gulpLess())
        .pipe(cleanCss())
        .pipe(dest('dist'));
}

function compile(done) {
    exec('$(npm bin)/ngc -p aot/tsconfig-aot.json', done);
}

function inlineResourcesTask() {
    return inlineResources(path.join(__dirname, 'dist'));
}

function cleanUp(done) {
    rimraf.sync('aot');
    done();
}

// gulp.task('build', gulp.series(
//     'clean',
//     'replace-less-url',
//     'copy-assets',
//     'less',
//     'compile',
//     'inline-resources',
//     'cleanup'
// ));

exports.default = series(clean, replaceLessUrl, copyAssets, less, compile, inlineResourcesTask, cleanUp);
