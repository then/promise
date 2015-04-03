var assert = require('better-assert');
var Promise = require('../');

describe('synchronous-inspection-tests', function () {
  it('can poll a promise to see if it is resolved', function () {
    var finished = null;
    var fulfilledPromise = new Promise(function(resolve, reject) {
      var interval = setInterval(function() {
        if (finished !== null) {
          clearTimeout(interval);

          if (finished) {
            resolve(true);
          }
          else {
            reject(false);
          }
        }
      }, 10);
    });

    assert(fulfilledPromise.isPending());
    assert(!fulfilledPromise.isFulfilled());
    assert(!fulfilledPromise.isRejected());

    finished = true;

    setTimeout(function () {
      assert(fulfilledPromise.isFulfilled());
      assert(!fulfilledPromise.isRejected());
      assert(fulfilledPromise.value());
      assert(!fulfilledPromise.isPending());
    }, 30);
  });

  it('can poll a promise to see if it is rejected', function () {
    var finished = null;
    var fulfilledPromise = new Promise(function(resolve, reject) {
      var interval = setInterval(function() {
        if (finished !== null) {
          clearTimeout(interval);

          if (finished) {
            resolve(true);
          }
          else {
            reject(false);
          }
        }
      }, 10);
    });

    assert(fulfilledPromise.isPending());
    assert(!fulfilledPromise.isFulfilled());
    assert(!fulfilledPromise.isRejected());

    finished = false;

    setTimeout(function () {
      assert(!fulfilledPromise.isFulfilled());
      assert(fulfilledPromise.isRejected());
      assert(!fulfilledPromise.reason());
      assert(!fulfilledPromise.isPending());
    }, 30);
  });

  it('will throw an error if getting a value of an unfulfilled promise', function () {
    var finished = null;
    var fulfilledPromise = new Promise(function(resolve, reject) {
      var interval = setInterval(function() {
        if (finished !== null) {
          clearTimeout(interval);

          if (finished) {
            resolve(true);
          }
          else {
            reject(false);
          }
        }
      }, 10);
    });

    assert(fulfilledPromise.isPending());
    assert(!fulfilledPromise.isFulfilled());
    assert(!fulfilledPromise.isRejected());

    try {
      fulfilledPromise.value();

      assert(false);
    }
    catch (e) {
      assert(true);
    }

    finished = false;

    setTimeout(function () {
      try {
        fulfilledPromise.value();

        assert(false);
      }
      catch (e) {
        assert(true);
      }
    }, 30);
  });

  it('will throw an error if getting a reason of a non-rejected promise', function () {
    var finished = null;
    var fulfilledPromise = new Promise(function(resolve, reject) {
      var interval = setInterval(function() {
        if (finished !== null) {
          clearTimeout(interval);

          if (finished) {
            resolve(true);
          }
          else {
            reject(false);
          }
        }
      }, 10);
    });

    assert(fulfilledPromise.isPending());
    assert(!fulfilledPromise.isFulfilled());
    assert(!fulfilledPromise.isRejected());

    try {
      fulfilledPromise.reason();

      assert(false);
    }
    catch (e) {
      assert(true);
    }

    finished = true;

    setTimeout(function () {
      try {
        fulfilledPromise.reason();

        assert(false);
      }
      catch (e) {
        assert(true);
      }
    }, 30);
  });
});
