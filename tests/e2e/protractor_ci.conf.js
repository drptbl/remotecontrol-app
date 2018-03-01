/* eslint-disable */
var jasmineReporters = require('jasmine-reporters');

var junitReporter = new jasmineReporters.JUnitXmlReporter({
  savePath: process.env.NEVERCODE_XUNIT_RESULTS_DIR,
  consolidateAll: false,
});

exports.config = {
  // seleniumAddress: 'http://localhost:4444/wd/hub',
  framework: 'jasmine2',
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
        args: ['--disable-web-security', 'no-sandbox']
    }
  },
  specs: ['tutorial/*_spec.js'],
  jasmineNodeOpts: {
      showColors: true, // If true, print colors to the terminal.
      showTiming: true,
      defaultTimeoutInterval: 30000, // Default time to wait in ms before a config fails.
      isVerbose: false,
      includeStackTrace: false
  },
  baseUrl: 'http://localhost:8090',
  allScriptsTimeout: 30000,
  onPrepare: function() {
    jasmine.getEnv().addReporter(junitReporter);
  },
};
