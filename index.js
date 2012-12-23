var isPromise = require('is-promise')

module.exports = Promise
function Promise(fn) {
  if (!(this instanceof Promise)) {
    return typeof fn === 'function' ? new Promise(fn) : defer()
  }
  var isResolved = false
  var isFulfilled = false
  var value
  var waiting = []
  var running = false

  if (typeof fn === 'function') {
    function resolve(val, success) {
      if (isResolved) return
      if (isPromise(val)) val.then(fulfill, reject)
      else {
        isResolved = true
        isFulfilled = success
        value = val
        next()
      }
    }
    function fulfill(val) {
      resolve(val, true)
    }
    function reject(err) {
      resolve(err, false)
    }
    fn({fulfill: fulfill, reject: reject})
  }

  function next(skipTimeout) {
    if (waiting.length) {
      running = true
      waiting.shift()(skipTimeout || false)
    } else {
      running = false
    }
  }
  this.then = then;
  function then(cb, eb) {
    return new Promise(function (resolver) {
      function done(skipTimeout) {
        var callback = isFulfilled ? cb : eb
        if (typeof callback === 'function') {
          function timeoutDone() {
            var val;
            try {
              val = callback(value)
            } catch (ex) {
              resolver.reject(ex)
              return next()
            }
            resolver.fulfill(val);
            next(true);
          }
          if (skipTimeout) timeoutDone()
          else setTimeout(timeoutDone, 0)
        } else if (isFulfilled) {
          resolver.fulfill(value)
          next(skipTimeout)
        } else {
          resolver.reject(value)
          next(skipTimeout)
        }
      }
      waiting.push(done)
      if (isResolved && !running) next()
    });
  }
}
function defer() {
  var resolver
  var promise = new Promise(function (res) { resolver = res })
  return {resolver: resolver, promise: promise}
}