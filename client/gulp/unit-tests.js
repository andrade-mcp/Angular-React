'use strict';

var gulp = require('gulp');

var $ = require('gulp-load-plugins')();

var wiredep = require('wiredep');
var karma = require('karma');
var concat = require('concat-stream');
var _ = require('lodash');

module.exports = function(options) {
  function listFiles(callback) {
    var wiredepOptions = _.extend({}, options.wiredep, {
      dependencies: true,
      devDependencies: true
    });
    var bowerDeps = wiredep(wiredepOptions);

    var additionalDeps = [
      'bower_components/angular-input-masks/angular-input-masks-standalone.js'
    ]

    var specFiles = [
      options.src + '/**/*.spec.js',
      options.tmp + '/**/*.spec.js',
      options.src + '/**/*.mock.js',
      options.tmp + '/**/*.mock.js'
    ];

    var htmlFiles = [
      options.src + '/**/*.html'
    ];

    var srcFiles = [
      options.tmp + '/serve/app/**/*.js'
    ].concat(specFiles.map(function(file) {
      return '!' + file;
    }));


    gulp.src(srcFiles)
      .pipe($.angularFilesort()).on('error', options.errorHandler('AngularFilesort'))
      .pipe(concat(function(files) {
        callback(bowerDeps.js
          .concat(additionalDeps)
          .concat(_.pluck(files, 'path'))
          .concat(htmlFiles)
          .concat(specFiles));
      }));
  }

  function runTests (singleRun, done) {
    listFiles(function(files) {
      karma.server.start({
        configFile: __dirname + '/../karma.conf.js',
        files: files,
        singleRun: singleRun,
        autoWatch: !singleRun
      }, function() { done(); });
    });
  }

  gulp.task('test', ['scripts'], function(done) {
    runTests(true, done);
  });
  gulp.task('test:auto', ['watch'], function(done) {
    runTests(false, done);
  });
};
