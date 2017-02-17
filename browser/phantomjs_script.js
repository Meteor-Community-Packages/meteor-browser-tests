var page = require('webpage').create();
var system = require('system');

var lastOutput = new Date();
page.onConsoleMessage = function(message) {
  lastOutput = new Date();
  console.log(message);
};

page.onError = function(msg, trace) {
  var testsAreRunning = page.evaluate(function() {
    return window.testsAreRunning;
  });
  if (testsAreRunning) return;
  console.error(msg);
  trace.forEach(function(item) {
    console.error('    ' + item.file + ': ' + item.line);
  });
  // We could call phantom.exit here, but sometimes there are benign client errors
  // and the tests still load and run fine. So instead there is a safeguard in the
  // setInterval to exit if nothing happens for awhile.
};

// Meteor will call the `runTests` function exported by the driver package
// on the client as soon as this page loads.
page.open(system.env.ROOT_URL);

setInterval(function() {
  var done = page.evaluate(function() {
    return window.testsDone;
  });
  if (done) {
    var failures = page.evaluate(function() {
      return window.testFailures;
    });
    // We pass back the number of failures as the exit code
    return phantom.exit(failures);
  }

  // As a safeguard, we will exit if there hasn't been console output for
  // 30 seconds.
  if ((new Date()) - lastOutput > 30000) {
    phantom.exit(2);
  }
}, 500);
