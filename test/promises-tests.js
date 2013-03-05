var path = require('path');
var fs = require('fs');

global.adapter = require('./adapter-a');

describe('promises-tests', function () {
  var testsDir = path.join(path.dirname(require.resolve('promises-aplus-tests/lib/programmaticRunner.js')), 'tests');
  var testFileNames = fs.readdirSync(testsDir);

  testFileNames.forEach(function (testFileName) {
    if (path.extname(testFileName) === ".js") {
      var testFilePath = path.join(testsDir, testFileName);
      require(testFilePath);
    }
  });
});