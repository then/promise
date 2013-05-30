var assert = require('better-assert');
var Promise = require('../');
var sentinel = {};
var promise = new Promise(function (resolve) {
  resolve(sentinel);
});
var thenable = {then: function (fullfilled, rejected) { fullfilled(sentinel) }}
var thenableRejected = {then: function (fullfilled, rejected) { rejected(sentinel) }}

describe('extensions', function () {
  describe('Promise.from', function () {
    describe('if passed a true promise', function () {
      it('returns it directly', function () {
        assert(promise === Promise.from(promise))
      })
    })
    describe('if passed a thenable', function () {
      it('assimilates it', function (done) {
        var i = 2
        var promise = Promise.from(thenable)
        var promiseRejected = Promise.from(thenableRejected)
        assert(promise instanceof Promise)
        assert(promiseRejected instanceof Promise)
        promise.then(function (res) {
          assert(res === sentinel)
          if (0 === --i) done()
        })
        .then(null, done)
        promiseRejected.then(null, function (err) {
          assert(err === sentinel)
          if (0 === --i) done()
        })
        .then(null, done)
      })
    })
    describe('if passed a value', function () {
      it('wraps it in a promise', function (done) {
        var promise = Promise.from(sentinel)
          .then(function (res) {
            assert(res === sentinel)
            done()
          })
        assert(promise instanceof Promise)
      })
    })
  })
  describe('Promise.denodeify(fn)', function () {
    it('returns a function that uses promises instead of callbacks', function (done) {
      function wrap(val, key, callback) {
        return callback(null, {val: val, key: key})
      }
      var pwrap = Promise.denodeify(wrap)
      pwrap(sentinel, 'foo')
        .then(function (wrapper) {
          assert(wrapper.val === sentinel)
          assert(wrapper.key === 'foo')
          done()
        })
    })
    it('converts callback error arguments into rejection', function (done) {
      function fail(val, key, callback) {
        return callback(sentinel)
      }
      var pfail = Promise.denodeify(fail)
      pfail(promise, 'foo')
        .then(null, function (err) {
          assert(err === sentinel)
          done()
        })
    })
  })
  describe('Promise.nodeify(fn)', function () {
    it('converts a promise returning function into a callback function', function (done) {
      var add = Promise.nodeify(function (a, b) {
        return Promise.from(a)
          .then(function (a) {
            return a + b
          })
      })
      add(1, 2, function (err, res) {
        if (err) return done(err)
        assert(res === 3)
        return done()
      })
    })
    it('converts rejected promises into the first argument of the callback', function (done) {
      var add = Promise.nodeify(function (a, b) {
        return Promise.from(a)
          .then(function (a) {
            throw sentinel
          })
      })
      var add2 = Promise.nodeify(function (a, b) {
        throw sentinel
      })
      add(1, 2, function (err, res) {
        assert(err === sentinel)
        add2(1, 2, function (err, res){
          assert(err === sentinel)
          done()
        })
      })
    })
    it('passes through when no callback is provided', function (done) {
      var add = Promise.nodeify(function (a, b) {
        return Promise.from(a)
          .then(function (a) {
            return a + b
          })
      })
      add(1, 2)
        .then(function (res) {
          assert(res === 3)
          done()
        })
    })
  })

  describe('promise.done(onFulfilled, onRejected)', function () {
    it.skip('behaves like then except for not returning anything', function () {
      //todo
    })
    it.skip('rethrows unhandled rejections', function () {
      //todo
    })
  })
  describe('promise.nodeify(callback)', function () {
    it('converts a promise returning function into a callback function', function (done) {
      function add(a, b, callback) {
        return Promise.from(a)
          .then(function (a) {
            return a + b
          })
          .nodeify(callback)
      }
      add(1, 2, function (err, res) {
        if (err) return done(err)
        assert(res === 3)
        return done()
      })
    })
    it('converts rejected promises into the first argument of the callback', function (done) {
      function add(a, b, callback) {
        return Promise.from(a)
          .then(function (a) {
            throw sentinel
          })
          .nodeify(callback)
      }
      add(1, 2, function (err, res) {
        assert(err === sentinel)
        done()
      })
    })
    it('passes through when no callback is provided', function (done) {
      function add(a, b, callback) {
        return Promise.from(a)
          .then(function (a) {
            return a + b
          })
          .nodeify(callback)
      }
      add(1, 2)
        .then(function (res) {
          assert(res === 3)
          done()
        })
    })
  })
})