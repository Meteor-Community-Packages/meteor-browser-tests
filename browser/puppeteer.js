/**
 * All browser drivers must do the following things:
 * - Open a page to ROOT_URL
 * - send all console messages to the stdout function
 * - send all errors to the stderr function, only when window.testsAreRunning is false
 * - When window.testsDone becomes true, call `done` with window.testFailures argument
 * - As a safeguard, exit with code 2 if there hasn't been console output
 *   for 30 seconds.
 */
const util = require('util');
const promiseRetry = require('promise-retry');

export default function startPuppeteer({
  stdout,
  stderr,
  done,
}) {
  let puppeteer;
  try {
    puppeteer = require('puppeteer');
  } catch (error) {
    console.error(error);
    throw new Error(
      'When running app tests with TEST_BROWSER_DRIVER=puppeteer, you must first ' +
      '"npm i --save-dev puppeteer@^1.2.0"'
    );
  }

  async function runTests() {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    console.log(await browser.version());
    const page = await browser.newPage();

    // console message args come in as handles, use this to evaluate them all and inspect
    async function evaluateHandles (msg) {
      return (await Promise.all(msg.args().map(arg => page.evaluate(h => h, arg))))
        .map(arg => (typeof arg !== 'string' ? util.inspect(arg, { depth: 1 }) : arg))
        .join(' ');
    }

    page.on('console', async (msg) => {
      // this is racy but how else to do it?
      const testsAreRunning = await page.evaluate(() => window.testsAreRunning);
      if (msg.type === 'error' && !testsAreRunning) {
        stderr(await evaluateHandles(msg));
      } else {
        stdout(await evaluateHandles(msg));
      }
    });

    // retry until connected to meteor test page
    await promiseRetry((retry, count) => {
      // console.log(`trying page ${URL}...`, count)
      return page.goto(process.env.ROOT_URL).catch(retry);
    }, { maxTimeout: 8000, retries: 20 });

    // wait for window.testsDone
    await promiseRetry((retry, count) => {
      // console.log('waiting for mocha...', count)
      return page.evaluate('window.testsDone')
        .then(testsDone => console.assert(testsDone, 'mocha not done...'))
        .catch(retry);
    }, { maxTimeout: 2000, retries: 100 });

    const testFailures = await page.evaluate('window.testFailures');
    done(testFailures);
    browser.close();
  }

  runTests();
}
