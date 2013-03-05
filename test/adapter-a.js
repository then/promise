var Promise = require('../');

module.exports = {
  pending: function () {
    var resolve, reject;
    var promise = new Promise(function (_resolve, _reject) {
      resolve = _resolve;
      reject = _reject;
    });
    return {
      promise: promise,
      fulfill: resolve,
      reject: reject
    };
  },
  fulfilled: function (value) {
    return new Promise(function (resolve) { resolve(value); });
  },
  rejected: function (value) {
    return new Promise(function (resolve, reject) { reject(value); });
  }
}
