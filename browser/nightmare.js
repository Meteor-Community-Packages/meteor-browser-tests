/**
 * All browser drivers must do the following things:
 * - Open a page to ROOT_URL
 * - send all console messages to the stdout function
 * - send all errors to the stderr function, only when window.testsAreRunning is false
 * - When window.testsDone becomes true, call `done` with window.testFailures argument
 * - As a safeguard, exit with code 2 if there hasn't been console output
 *   for 30 seconds.
 */

// HINT: If not working, run with `DEBUG=nightmare:*,electron:*` to see nightmare errors

const show = !!process.env.TEST_BROWSER_VISIBLE;
const TWENTY_DAYS = 1000 * 60 * 60 * 24 * 20;

let nightmare;

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;

// Make sure the nightmare process does not stick around
process.on('exit', () => {
  if (nightmare) {
    nightmare.end();
  }
});

export default function startNightmare({
  stdout,
  stderr,
  done,
}) {
  let Nightmare;
  try {
    Nightmare = require('nightmare');
  } catch (error) {
    throw new Error('When running tests with TEST_BROWSER_DRIVER=nightmare, you must first "npm i --save-dev nightmare"');
  }

  nightmare = Nightmare({
    show,
    // Controls maximum time client tests can take for Meteor to still
    // automatically exit after they complete.
    // Defaults to 20 days
    waitTimeout: process.env.NIGHTMARE_WAIT_TIMEOUT || TWENTY_DAYS,
  });

  let testFailures;
  nightmare
    .on('page', (type, message, stack) => {
      if (type === 'error') {
        stderr(`[ERROR] ${message}\n${stack}`);
      } else {
        stdout(`[${type}] ${message}`);
      }
    })
    .on('console', (type, ...args) => {
      let msgType = type;

      // unknown console types are mapped or become a warning with addl context
      if(typeof console[msgType] === "undefined") {
        msgType = 'warn';
        console.warn(`UNKNOWN CONSOLE TYPE: ${msgType}`);
      }

      console[msgType](...args);
    })

    // Meteor will call the `runTests` function exported by the driver package
    // on the client as soon as this page loads.
    .goto(process.env.ROOT_URL, {
      'http-equiv': 'Content-Security-Policy',
      content: 'script-src \'unsafe-eval\'',
    })

    // After the page loads, the tests are running. Eventually they
    // finish and the driver package is supposed to set window.testsDone
    // and window.testFailures at that time.
    .wait(function () {
      return window.testsDone;
    })
    .evaluate(function () {
      return window.testFailures;
    })
    .then(failures => {
      testFailures = failures;
      return nightmare.end();
    })
    .then(() => {
      nightmare = null;
      done(testFailures);
    })
    .catch(error => {
      stderr(error && error.message);
    });
}
