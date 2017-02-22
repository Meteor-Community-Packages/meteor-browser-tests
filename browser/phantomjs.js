/**
 * All browser drivers must do the following things:
 * - Open a page to ROOT_URL
 * - send all console messages to the stdout function
 * - send all errors to the stderr function, only when window.testsAreRunning is false
 * - When window.testsDone becomes true, call `done` with window.testFailures argument
 * - As a safeguard, exit with code 2 if there hasn't been console output
 *   for 30 seconds.
 */
import childProcess from 'child_process';

const PHANTOMJS_SCRIPT_FILE_NAME = 'browser/phantomjs_script.js';

export default function startPhantom({
  stdout,
  stderr,
  done,
}) {
  let phantomjs;
  try {
    phantomjs = require('phantomjs-prebuilt');
  } catch (error) {
    throw new Error('When running tests with TEST_BROWSER_DRIVER=phantomjs, you must first "npm i --save-dev phantomjs-prebuilt"');
  }

  const scriptPath = Assets.absoluteFilePath(PHANTOMJS_SCRIPT_FILE_NAME);

  if (process.env.METEOR_TEST_DEBUG) {
    console.log('PhantomJS Path:', phantomjs.path);
    console.log('PhantomJS Script Path:', scriptPath);
  }

  const browserProcess = childProcess.execFile(phantomjs.path, [scriptPath], {
    env: {
      ROOT_URL: process.env.ROOT_URL,
    },
  });

  browserProcess.on('error', error => {
    throw error;
  });

  browserProcess.on('exit', done);

  // The PhantomJS script echoes whatever the page prints to the browser console and
  // here we echo that once again.
  browserProcess.stdout.on('data', stdout);
  browserProcess.stderr.on('data', stderr);
}
