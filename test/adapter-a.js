var Promise = require('../');
module.exports = {
  pending: function () {
    var resolver;
    var promise = new Promise(function (res) { resolver = res; });
    return {
      promise: promise,
      fulfill: resolver.fulfill,
      reject: resolver.reject
    };
  },
  fulfilled: function (value) {
    return new Promise(function (res) { res.fulfill(value); });
  },
  rejected: function (value) {
    return new Promise(function (res) { res.reject(value); });
  }
}