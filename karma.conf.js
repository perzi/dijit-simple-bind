module.exports = function(config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '',

    frameworks: ['jasmine', 'dojo'],

    // list of files / patterns to load in the browser
    files: [
      'karma-main.js',

      // all the sources, tests
    //   {pattern: 'test/**/*Spec.js', included: true},
      {pattern: '*.js', included: false},
      {pattern: 'test/*.js', included: false}
    ],


    // test results reporter to use
    // possible values: dots || progress
    reporters: ['mocha', 'osx'],


    // web server port
    port: 9876,


    // cli runner port
    runnerPort: 9100,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari
    // - PhantomJS
    browsers: process.env.TRAVIS ? ['Firefox'] : ['Chrome', 'Firefox'],


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    plugins: [
      'karma-dojo',
      'karma-jasmine',
      'karma-mocha-reporter',
      'karma-osx-reporter',
      'karma-chrome-launcher',
      'karma-firefox-launcher'
    ]
  });
};
