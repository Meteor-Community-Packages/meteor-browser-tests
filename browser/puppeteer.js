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

const TWENTY_DAYS = 1000 * 60 * 60 * 24 * 20;

export default function startPuppeteer({
  stdout,
  stderr,
  done,
}) {
  let puppeteer;
  try {
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    puppeteer = require('puppeteer');
  } catch (error) {
    console.error(error);
    throw new Error(
      'When running app tests with TEST_BROWSER_DRIVER=puppeteer, you must first ' +
        '"npm i --save-dev puppeteer@^19.11.1"'
    );
  }

  async function runTests() {
    // --no-sandbox and --disable-setuid-sandbox allow this to easily run in docker
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: 'new',
      protocolTimeout: Number.parseInt(process.env.PUPPETEER_PROTOCOL_TIMEOUT, 10) || TWENTY_DAYS,
    });
    console.log(await browser.version());
    const page = await browser.newPage();

    // emitted when the page crashes
    page.on('error', (err) => {
      console.warn('The page has crashed.', err);
    });

    let consolePromise = Promise.resolve();

    // console message args come in as handles, use this to evaluate them all
    page.on('console', msg => {
      let msgType = msg.type();

      consolePromise = consolePromise.then(async () => {
        // this is racy but how else to do it?
        const testsAreRunning = await page.evaluate('window.testsAreRunning');
        const messages = await Promise.all(
          msg.args().map((arg) => arg.jsonValue()),
        );

        if (msgType === 'error' && !testsAreRunning) {
          stderr(util.format(...messages));
        } else {
          stdout(util.format(...messages));
        }
      });
    });

    await page.goto(process.env.ROOT_URL);

    await page.waitForFunction(() => window.testsDone, { timeout: 0 });
    const testFailures = await page.evaluate('window.testFailures');

    await consolePromise;
    await page.close();
    await browser.close();

    done(testFailures);
  }

  runTests();
}
