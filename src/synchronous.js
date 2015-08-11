'use strict';

var Promise = require('./core.js');

module.exports = Promise;
Promise.enableSynchronous = function () {
  Promise.prototype.isPending = function() {
    return this._state == 0;
  };

  Promise.prototype.isFulfilled = function() {
    return this._state == 1;
  };

  Promise.prototype.isRejected = function() {
    return this._state == 2;
  };

  Promise.prototype.value = function () {
    if (!this.isFulfilled()) {
      throw new Error('Cannot get a value of an unfulfilled promise.');
    }

    return this._value;
  };

  Promise.prototype.reason = function () {
    if (!this.isRejected()) {
      throw new Error('Cannot get a rejection reason of a non-rejected promise.');
    }

    return this._value;
  };
};
