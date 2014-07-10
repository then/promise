var assert = require('better-assert')
var Promise = require('../')
var sentinel = {}
var promise = new Promise(function (resolve) {
  resolve(sentinel)
})
var thenable = {then: function (fullfilled, rejected) { fullfilled(sentinel) }}
var thenableRejected = {then: function (fullfilled, rejected) { rejected(sentinel) }}

var a = {}
var b = {}
var c = {}

var A = Promise.resolve(a)
var B = Promise.resolve(b)
var C = Promise.resolve(c)

var rejection = {}
var rejected = new Promise(function (resolve, reject) { reject(rejection) })

describe('extensions', function () {
  describe('Promise.denodeify(fn, [argumentCount])', function () {
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
    it('with an argumentCount it ignores extra arguments', function (done) {
      function wrap(val, key, callback) {
        return callback(null, {val: val, key: key})
      }
      var pwrap = Promise.denodeify(wrap, 2)
      pwrap(sentinel, 'foo', 'wtf')
        .then(function (wrapper) {
          assert(wrapper.val === sentinel)
          assert(wrapper.key === 'foo')
          done()
        })
    })
  })
  describe('Promise.nodeify(fn)', function () {
    it('converts a promise returning function into a callback function', function (done) {
      var add = Promise.nodeify(function (a, b) {
        return Promise.resolve(a)
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
        return Promise.resolve(a)
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
        return Promise.resolve(a)
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
    it('passes through the `this` argument', function (done) {
      var ctx = {}
      var add = Promise.nodeify(function (a, b) {
        return Promise.resolve(a)
          .then(function (a) {
            return a + b
          })
      })
      add.call(ctx, 1, 2, function (err, res) {
        assert(res === 3)
        assert(this === ctx)
        done()
      })
    })
  })
  describe('Promise.all(...)', function () {
    describe('an array', function () {
      describe('that is empty', function () {
        it('returns a promise for an empty array', function (done) {
          var res = Promise.all([])
          assert(res instanceof Promise)
          res.then(function (res) {
            assert(Array.isArray(res))
            assert(res.length === 0)
          })
          .nodeify(done)
        })
      })
      describe('of objects', function () {
        it('returns a promise for the array', function (done) {
          var res = Promise.all([a, b, c])
          assert(res instanceof Promise)
          res.then(function (res) {
            assert(Array.isArray(res))
            assert(res[0] === a)
            assert(res[1] === b)
            assert(res[2] === c)
          })
          .nodeify(done)
        })
      })
      describe('of promises', function () {
        it('returns a promise for an array containing the fulfilled values', function (done) {
          var res = Promise.all([A, B, C])
          assert(res instanceof Promise)
          res.then(function (res) {
            assert(Array.isArray(res))
            assert(res[0] === a)
            assert(res[1] === b)
            assert(res[2] === c)
          })
          .nodeify(done)
        })
      })
      describe('of mixed values', function () {
        it('returns a promise for an array containing the fulfilled values', function (done) {
          var res = Promise.all([A, b, C])
          assert(res instanceof Promise)
          res.then(function (res) {
            assert(Array.isArray(res))
            assert(res[0] === a)
            assert(res[1] === b)
            assert(res[2] === c)
          })
          .nodeify(done)
        })
      })
      describe('containing at least one rejected promise', function () {
        it('rejects the resulting promise', function (done) {
          var res = Promise.all([A, rejected, C])
          assert(res instanceof Promise)
          res.then(function (res) {
            throw new Error('Should be rejected')
          },
          function (err) {
            assert(err === rejection)
          })
          .nodeify(done)
        })
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
        return Promise.resolve(a)
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
        return Promise.resolve(a)
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
        return Promise.resolve(a)
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
    it('accepts a `context` argument', function (done) {
      var ctx = {}
      function add(a, b, callback) {
        return Promise.resolve(a)
          .then(function (a) {
            return a + b
          })
          .nodeify(callback, ctx)
      }
      add(1, 2, function (err, res) {
        assert(res === 3)
        assert(this === ctx)
        done()
      })
    })
  })

  describe('inheritance', function () {
    it('allows its prototype methods to act upon foreign constructors', function () {
      function Awesome(fn) {
        if (!(this instanceof Awesome)) return new Awesome(fn)
        Promise.call(this, fn)
      }
      Awesome.prototype = Object.create(Promise.prototype)
      Awesome.prototype.constructor = Awesome

      var awesome = new Awesome(function () {})

      assert(awesome.constructor === Awesome)
      assert(awesome.then(function () {}).constructor === Awesome)
    })
  })
})
