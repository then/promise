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
  it('tracks rejected promises', function (done) {
    this.timeout(2300);
    var warn = console.warn;
    var warnings = [];
    console.warn = function (str) {
      warnings.push(str);
    };
    var expectedWarnings = [
      'Possible Unhandled Promise Rejection (id: 0):',
      '  my',
      '  multi',
      '  line',
      '  error',
      'Promise Rejection Handled (id: 0):',
      '  This means you can ignore any previous messages of the form "Possible Unhandled Promise Rejection" with id 0.'
    ];
    tracking.enable({allRejections: true});
    var promise = Promise.reject('my\nmulti\nline\nerror');
    setTimeout(function () {
      promise.done(null, function (err) {
        console.warn = warn;
        assert.deepEqual(warnings, expectedWarnings);
        done();
      });
    }, 2100);
  })
})