'use strict';

let id = 1;
Promise._onHandle = function (promise) {
  if (
    promise._state === 2 // IS REJECTED
  ) {
    if (promise._rejectionEmitted) {
      promise.emit('rejectionHandled', promise);
      if (promise._loggingID) {
        console.warn(
          'Promise Rejection Handled (id: ' + promise._loggingID + '):'
        );
        console.warn(
          '  This means you can ignore any previous messages of the form ' +
          '"Possible Unhandled Promise Rejection" with id ' +
          promise._loggingID + '.'
        );
      }
    } else {
      clearTimeout(promise._rejectionEmitTimer);
    }
  }
};
Promise._onReject = function (promise, err) {
  if (promise._deferredState === 0) { // not yet handled
    promise._rejectionEmitTimer = setTimeout(function () {
      promise._rejectionEmitted = true;
      process.emit('unhandledRejection', promise, err);
      if (
        process.listenerCount &&
        process.listenerCount('unhandledRejection') === 0
      ) {
        promise._loggingID = id++;
        console.warn(
          'Possible Unhandled Promise Rejection (id: ' +
          promise._loggingID +
          '):'
        );
        var errStr = (error && (error.stack || error)) + '';
        errStr.split('\n').forEach(function (line) {
          console.warn('  ' + line);
        });
      }
    }, 0);
  }
};
