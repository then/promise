var nextTick = require('next-tick')
var isPromise = require('is-promise')

module.exports = Promise
function Promise(fn) {
  if (!(this instanceof Promise)) return new Promise(fn)
  if (typeof fn !== 'function') throw new TypeError('not a function')
  var state = null
    , value = null
    , deferreds = []

  this.then = function(onFulfilled, onRejected) {
    return new Promise(function(resolve, reject) {
      handle({ onFulfilled: onFulfilled, onRejected: onRejected, resolve: resolve, reject: reject })
    })
  }

  function handle(deferred) {
    if (state === null) {
      deferreds.push(deferred)
      return
    }
    nextTick(function() {
      var cb = state ? deferred.onFulfilled : deferred.onRejected
      if (typeof cb !== 'function'){
        (state ? deferred.resolve : deferred.reject)(value)
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
    })
  }

  function resolve(newValue) {
    if (state !== null)
      return
    if (isPromise(newValue)) {
      newValue.then(resolve, reject)
      return
    }
    state = true
    value = newValue
    finale()
  }

  function reject(newValue) {
    if (state !== null)
      return
    state = false
    value = newValue
    finale()
  }

  function finale() {
    for (var i = 0, len = deferreds.length; i < len; i++)
      handle(deferreds[i])
    deferreds = null
  }

  try { fn(resolve, reject) }
  catch(e) { reject(e) }
}
