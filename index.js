'use strict'

//This file contains then/promise specific extensions to the core promise API

var Promise = require('./core.js')
var nextTick = require('./lib/next-tick')

module.exports = Promise

/* Static Functions */

Promise.from = function (value) {
  if (value instanceof Promise) return value
  return new Promise(function (resolve) { resolve(value) })
}
Promise.denodeify = function (fn) {
  return function () {
    var self = this
    var args = Array.prototype.slice.call(arguments)
    return new Promise(function (resolve, reject) {
      args.push(function (err, res) {
        if (err) reject(err)
        else resolve(res)
      })
      fn.apply(self, args)
    })
  }
}
Promise.nodeify = function (fn) {
  return function () {
    var args = Array.prototype.slice.call(arguments)
    var callback = typeof args[args.length - 1] === 'function' ? args.pop() : null
    try {
      return fn.apply(this, arguments).nodeify(callback)
    } catch (ex) {
      if (callback == null) {
        return new Promise(function (resolve, reject) { reject(ex) })
      } else {
        nextTick(function () {
          callback(ex)
        })
      }
    }
  }
}

Promise.all = function () {
  var args = Array.prototype.slice.call(arguments.length === 1 && Array.isArray(arguments[0]) ? arguments[0] : arguments)

  return new Promise(function (resolve, reject) {
    if (args.length === 0) return resolve([])
    var remaining = args.length
    function res(i, val) {
      try {
        if (val && (typeof val === 'object' || typeof val === 'function')) {
          var then = val.then
          if (typeof then === 'function') {
            then.call(val, function (val) { res(i, val) }, reject)
            return
          }
        }
        args[i] = val
        if (--remaining === 0) {
          resolve(args);
        }
      } catch (ex) {
        reject(ex)
      }
    }
    for (var i = 0; i < args.length; i++) {
      res(i, args[i])
    }
  })
}

/* Prototype Methods */

Promise.prototype.done = function (onFulfilled, onRejected) {
  var self = arguments.length ? this.then.apply(this, arguments) : this
  self.then(null, function (err) {
    nextTick(function () {
      throw err
    })
  })
}
Promise.prototype.nodeify = function (callback) {
  if (callback == null) return this

  this.then(function (value) {
    nextTick(function () {
      callback(null, value)
    })
  }, function (err) {
    nextTick(function () {
      callback(err)
    })
  })
}