import startPhantom from './browser/phantomjs';
import startChrome from './browser/chromedriver';
import startNightmare from './browser/nightmare';

const supportedDrivers = ['chrome', 'nightmare', 'phantomjs'];

const driver = process.env.TEST_BROWSER_DRIVER;

function startBrowser(options) {
  const driverOptions = {
    ...options,
    stdout(message) {
      // Remove empty "stdout" lines. Not sure where these come from.
      // See https://github.com/DispatchMe/meteor-mocha-phantomjs/issues/30
      if (typeof message === 'string' && message.startsWith('stdout:')) return;
      options.stdout(message);
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

    default:
      throw new Error(
        `Unknown driver "${driver}". browser-tests package requires that you set the TEST_BROWSER_DRIVER` +
        ` environment variable to one of the following: ${supportedDrivers.join(', ')}`
      );
  }
}

export { startBrowser };
