var assert = require('better-assert');
var Promise = require('../');

describe('synchronous-inspection-tests', function () {
  it('cannot synchronously inspect before enabling synchronous inspection', function() {
    var finished = null;
    var fulfilledPromise = new Promise(function(resolve, reject) {
      setTimeout(function() {
        resolve();
      }, 500);
    });
    var rejectedPromise = new Promise(function(resolve, reject) {
      setTimeout(function() {
        reject();
      }, 500);
    });

    assert(fulfilledPromise.value == undefined);
    assert(fulfilledPromise.reason == undefined);
    assert(fulfilledPromise.isFulfilled == undefined);
    assert(fulfilledPromise.isPending == undefined);
    assert(fulfilledPromise.isRejected == undefined);

    assert(rejectedPromise.value == undefined);
    assert(rejectedPromise.reason == undefined);
    assert(rejectedPromise.isFulfilled == undefined);
    assert(rejectedPromise.isPending == undefined);
    assert(rejectedPromise.isRejected == undefined);

    setTimeout(function() {
      assert(fulfilledPromise.value == undefined);
      assert(fulfilledPromise.reason == undefined);
      assert(fulfilledPromise.isFulfilled == undefined);
      assert(fulfilledPromise.isPending == undefined);
      assert(fulfilledPromise.isRejected == undefined);

      assert(rejectedPromise.value == undefined);
      assert(rejectedPromise.reason == undefined);
      assert(rejectedPromise.isFulfilled == undefined);
      assert(rejectedPromise.isPending == undefined);
      assert(rejectedPromise.isRejected == undefined);
    }, 500);

  });

  it('can poll a promise to see if it is resolved', function () {
    Promise.enableSynchronous();
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
    Promise.enableSynchronous();
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
          }'s'
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
    Promise.enableSynchronous();
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
    Promise.enableSynchronous();
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
