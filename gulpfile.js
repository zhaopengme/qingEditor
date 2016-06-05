'use strict';

var gulp = require('gulp');
var livereload = require('gulp-livereload');
var path = require('path');
var semverRegex = require('semver-regex');
var resolve = path.resolve;

gulp.task('clean-dist', function() {
    return require('rimraf').sync(resolve(__dirname, 'dist'));
});
// 'linux-x64',

gulp.task('dist', ['clean-dist'], function(cb) {
    var packager = require('electron-packager');
    var packageJson = require('./package.json');
    var version = packageJson.devDependencies['electron-prebuilt'].match(semverRegex())[0];

//    packager({
//        arch: 'x64',
//        platform: 'darwin',
//        dir: '.',
//        out: 'dist'
//    }, cb);
    packager({
        arch: 'x64',
        platform: 'win32',
        dir: '.',
        out: 'dist'
    }, cb);
});

gulp.task('dev', function(cb) {

    livereload.listen({ port: 35729 });

    gulp.watch('src/*', function(event) {
        gulp.src('src/*').pipe(livereload());
    });
    var isWin = /^win/.test(process.platform);
    var environment = process.env;
    environment.env = 'dev';

    require('child_process')
        .exec((isWin ? 'sh' : 'node') + ' ./node_modules/.bin/electron ./src/', {
            cwd: __dirname,
            environment
        }, cb);
});
