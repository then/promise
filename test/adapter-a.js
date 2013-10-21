var Promise = require('../');

module.exports = {
  deferred: function () {
    var resolve, reject;
    var promise = new Promise(function (_resolve, _reject) {
      resolve = _resolve;
      reject = _reject;
    });
    return {
      promise: promise,
      resolve: resolve,
      reject: reject
    };
  },
  resolved: function (value) {
    return Promise.from(value);
  },
  rejected: function (value) {
    return new Promise(function (resolve, reject) { reject(value); });
  }
}
