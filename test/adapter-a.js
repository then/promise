var Promise = require('../');


exports.deferred = function () {
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
};
exports.resolved = Promise.resolve;
exports.rejected = Promise.reject;