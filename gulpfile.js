var gulp = require('gulp');
var mocha = require('gulp-mocha');
var jshint = require('gulp-jshint');

gulp.task('test', function() {
    return gulp.src('test/*.spec.js')
        .pipe(mocha({reporter: 'spec'}));
});

gulp.task('lint', ['test'], function() {
    return gulp.src('index.js')
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('default', ['test', 'lint'], function() {
});