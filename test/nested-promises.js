'use strict';
/*global describe:true, it:true */
var assert = require('assert');
var Promise = require('../');

describe('nested promises', function () {
  it('does not result in any wierd behaviour - 1', function (done) {
    var resolveA, resolveB, resolveC;
    var A = new Promise(function (resolve, reject) {
      resolveA = resolve;
    });
    var B = new Promise(function (resolve, reject) {
      resolveB = resolve;
    });
    var C = new Promise(function (resolve, reject) {
      resolveC = resolve;
    });
    resolveA(B);
    resolveB(C);
    resolveC('foo');
    A.done(function (result) {
      assert(result === 'foo');
      done();
    });
  });
  it('does not result in any wierd behaviour - 2', function (done) {
    var resolveA, resolveB, resolveC, resolveD;
    var A = new Promise(function (resolve, reject) {
      resolveA = resolve;
    });
    var B = new Promise(function (resolve, reject) {
      resolveB = resolve;
    });
    var C = new Promise(function (resolve, reject) {
      resolveC = resolve;
    });
    var D = new Promise(function (resolve, reject) {
      resolveD = resolve;
    });
    resolveA(B);
    resolveB(C);
    resolveC(D);
    resolveD('foo');
    A.done(function (result) {
      assert(result === 'foo');
      done();
    });
  });
  it('does not result in any wierd behaviour - 2', function (done) {
    var promises = [];
    var resolveFns = [];
    for (var i = 0; i < 100; i++) {
      promises.push(new Promise(function (resolve) {
        resolveFns.push(resolve);
      }));
    }
    for (var j = 0; j < 99; j++) {
      resolveFns[j](promises[j + 1]);
    }
    resolveFns[99]('foo');
    promises[0].done(function (result) {
      assert(result === 'foo');
      done();
    });
  });
});
