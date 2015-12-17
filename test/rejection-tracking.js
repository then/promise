'use strict';

var assert = require('assert');
var Promise = require('../');
var tracking = require('../lib/rejection-tracking');

describe('unhandled rejections', function () {
  it('tracks rejected promises', function (done) {
    this.timeout(300);
    var calls = [], promise;
    tracking.enable({
      onUnhandled: function (id, err) {
        calls.push(['unhandled', id, err]);
        promise.done(null, function (err) {
          assert.deepEqual(calls, [
            ['unhandled', 0, err],
            ['handled', 0, err]
          ]);
          done();
        });
      },
      onHandled: function (id, err) {
        calls.push(['handled', id, err]);
      }
    });
    promise = Promise.reject(new TypeError('A fake type error'));
  })
  it('tracks rejected promises', function (done) {
    this.timeout(2200);
    var calls = [], promise;
    tracking.enable({
      allRejections: true,
      onUnhandled: function (id, err) {
        calls.push(['unhandled', id, err]);
        promise.done(null, function (err) {
          assert.deepEqual(calls, [
            ['unhandled', 0, err],
            ['handled', 0, err]
          ]);
          done();
        });
      },
      onHandled: function (id, err) {
        calls.push(['handled', id, err]);
      }
    });
    promise = Promise.reject({});
  })
  it('tracks rejected promises', function (done) {
    this.timeout(500);
    var calls = [], promise;
    tracking.enable({
      onUnhandled: function (id, err) {
        done(new Error('Expected exception to be handled in time'));
      },
      onHandled: function (id, err) {
      }
    });
    promise = Promise.reject(new TypeError('A fake type error'));
    var isDone = false;
    setTimeout(function () {
      promise.done(null, function (err) {
        // ignore
        isDone = true;
      });
    }, 50);
    setTimeout(function () {
      assert(isDone);
      done();
    }, 400);
  })
})