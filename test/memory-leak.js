'use strict';

var assert = require('assert')
var Promise = require('../')

var i = 0
var sampleA, sampleB

function next() {
  return new Promise(function (resolve) {
    i++
    /*
    if (i % 100000 === 0) {
      global.gc()
      console.dir(process.memoryUsage())
    }
    */
    if (i === 100000 && typeof global.gc === 'function') {
      global.gc()
      sampleA = process.memoryUsage()
    }
    if (i > 100000 * 10) {
      if (typeof global.gc === 'function') {
        global.gc()
        sampleB = process.memoryUsage()
        console.log('Memory usage at start:');
        console.dir(sampleA)
        console.log('Memory usage at end:');
        console.dir(sampleB)
        assert(sampleA.heapUsed * 1.2 > sampleB.heapUsed, 'heapUsed should not grow by more than 20%')
      }
    } else {
      setImmediate(resolve)
    }
  }).then(next)
}

if (typeof global.gc !== 'function') {
  console.warn('You must run with --expose-gc to test for memory leak.')
}
next().done()
