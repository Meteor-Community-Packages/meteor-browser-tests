import startPhantom from './browser/phantomjs';
import startChrome from './browser/chromedriver';
import startNightmare from './browser/nightmare';
import startPuppeteer from './browser/puppeteer';

const supportedDrivers = ['chrome', 'nightmare', 'phantomjs', 'puppeteer'];

const driver = process.env.TEST_BROWSER_DRIVER;

function startBrowser(options) {
  const driverOptions = {
    ...options,
    stdout(message) {
      // Don't just throw away the stdout messages. They're data from a writable buffer.
      if (typeof message === 'string' && message.startsWith('stdout: ')) {
        if (typeof options.writebuffer === 'function') {
          options.writebuffer(message.substr(8));
        }
      } else {
        options.stdout(message);
      }
    },
  };

  switch (driver) {
    case 'chrome':
      startChrome(driverOptions);
      break;

    case 'phantomjs':
      startPhantom(driverOptions);
      break;

    case 'nightmare':
      startNightmare(driverOptions);
      break;

    case 'puppeteer':
      startPuppeteer(driverOptions);
      break;

    default:
      throw new Error(
        `Unknown driver "${driver}". browser-tests package requires that you set the TEST_BROWSER_DRIVER` +
        ` environment variable to one of the following: ${supportedDrivers.join(', ')}`
      );
  }
}

export { startBrowser };
