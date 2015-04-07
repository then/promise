'use strict';

var asap = require('asap/raw')

function noop() {};

var thenError = null;
var IS_ERROR = {};
function getThen(obj) {
  try {
    return obj.then;
  } catch (ex) {
    thenError = ex;
    return IS_ERROR;
  }
}

module.exports = Promise;
function Promise(fn) {
  if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new')
  if (typeof fn !== 'function') throw new TypeError('not a function')
  this._state = 0;
  this._value = null;
  this._deferreds = [];
  if (fn === noop) return;
  doResolve(fn, this);
}
Promise.prototype._safeThen = function (onFulfilled, onRejected) {
  var self = this;
  return new this.constructor(function (resolve, reject) {
    var res = new Promise(noop);
    res.then(resolve, reject);
    self._handle(new Handler(onFulfilled, onRejected, res));
  });
};
Promise.prototype.then = function(onFulfilled, onRejected) {
  if (this.constructor !== Promise) return this._safeThen(onFulfilled, onRejected);
  var res = new Promise(noop);
  this._handle(new Handler(onFulfilled, onRejected, res));
  return res;
};
Promise.prototype._handle = function(deferred) {
  if (this._state === 3) {
    this._value._handle(deferred);
    return;
  }
  if (this._state === 0) {
    this._deferreds.push(deferred);
    return;
  }
  var state = this._state;
  var value = this._value;
  asap(function() {
    var cb = state === 1 ? deferred.onFulfilled : deferred.onRejected
    if (cb === null) {
      (state === 1 ? deferred.resolve(value) : deferred.reject(value))
      return
    }
    var ret
    try {
      ret = cb(value)
    }
    catch (e) {
      deferred.reject(e)
      return
    }
    deferred.resolve(ret)
  });
};
Promise.prototype._resolve = function(newValue) {
  //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
  if (newValue === this) {
    return this._reject(new TypeError('A promise cannot be resolved with itself.'))
  }
  if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
    var then = getThen(newValue);
    if (then === IS_ERROR) {
      return this._reject(thenError);
    }
    if (
      then === this.then &&
      newValue instanceof Promise &&
      newValue._handle === this._handle
    ) {
      this._state = 3;
      this._value = newValue;
      for (var i = 0; i < this._deferreds.length; i++) {
        newValue._handle(this._deferreds[i]);
      }
      return;
    } else if (typeof then === 'function') {
      doResolve(then.bind(newValue), this)
      return
    }
  }
  this._state = 1
  this._value = newValue
  this._finale()
}

Promise.prototype._reject = function (newValue) {
  this._state = 2
  this._value = newValue
  this._finale()
}
Promise.prototype._finale = function () {
  for (var i = 0; i < this._deferreds.length; i++)
    this._handle(this._deferreds[i])
  this._deferreds = null
}


function Handler(onFulfilled, onRejected, promise){
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null
  this.onRejected = typeof onRejected === 'function' ? onRejected : null
  this.promise = promise;
}
Handler.prototype.resolve = function (value) {
  this.promise._resolve(value);
};
Handler.prototype.reject = function (value) {
  this.promise._reject(value);
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 */
function doResolve(fn, promise) {
  var done = false;
  try {
    fn(function (value) {
      if (done) return
      done = true
      promise._resolve(value)
    }, function (reason) {
      if (done) return
      done = true
      promise._reject(reason)
    })
  } catch (ex) {
    if (done) return
    done = true
    promise._reject(ex)
  }
}