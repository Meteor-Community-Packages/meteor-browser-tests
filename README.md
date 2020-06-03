# meteortesting:browser-tests

_Formerly published as aldeed:browser-tests_

This package exports a `startBrowser` function for server code, which runs your client tests within a headless browser page. Meteor test driver packages can depend on this package. See the example implementation here: https://github.com/DispatchMe/meteor-mocha

NOTE: This package replaces [dispatch:phantomjs-tests](https://github.com/DispatchMe/meteor-phantomjs-tests). This package supports PhantomJS as well as others, and can be easily updated to support more.

## Usage

In your test driver package `package.js` file, add

```js
api.use('meteortesting:browser-tests@0.0.1', 'server');
```

Then in your server code, do something similar to this:

```js
import { startBrowser } from 'meteor/meteortesting:browser-tests';

function start() {
  startBrowser({
    stdout(data) {
      console.log(data.toString());
    },
    stderr(data) {
      console.log(data.toString());
    },
    done(failureCount) {
      // Your code to run when client tests are done running
    },
  });
}

export { start };
```

And in your client code, you need to set some properties on `window` so that the browser script knows what is happening. Here is an example using Mocha:

```js
// Run the client tests. Meteor calls the `runTests` function exported by
// the driver package on the client.
function runTests() {
  // These `window` properties are all used by the browser script to
  // know what is happening.
  window.testsAreRunning = true;
  mocha.run((failures) => {
    window.testsAreRunning = false;
    window.testFailures = failures;
    window.testsDone = true;
  });
}

export { runTests };
```

## Dependencies

When using your test driver package, you will need to install the necessary NPM package dependency and indicate which headless browser you want to use.

### Puppeteer

```bash
$ npm i --save-dev puppeteer@^1.5.0
$ TEST_BROWSER_DRIVER=puppeteer meteor test --once --driver-package <your package name>
```

### Selenium ChromeDriver

Meteor 1.6+:

```bash
$ meteor npm i --save-dev selenium-webdriver chromedriver
$ TEST_BROWSER_DRIVER=chrome meteor test --once --driver-package <your package name>
```

Chrome will run headless unless you export `TEST_BROWSER_VISIBLE=1`.

Additional command-line arguments for Chrome can be specified using the `TEST_CHROME_ARGS` environment variable. Multiple arguments are supported, separated by spaces. If you need to include a space inside an individual argument, use `%20` instead of the space.

Meteor < 1.6:

**NOTE: Currently you must pin to exactly version 3.0.0-beta-2 of selenium-webdriver for earlier versions of Meteor because the latest webdriver package only works on Node 6.x+. The `-E` in the command below is important!**

```bash
$ meteor npm i -E --save-dev selenium-webdriver@3.0.0-beta-2
$ meteor npm i --save-dev chromedriver
$ TEST_BROWSER_DRIVER=chrome meteor test --once --driver-package <your package name>
```

### Nightmare/Electron

```bash
$ npm i --save-dev nightmare
$ TEST_BROWSER_DRIVER=nightmare meteor test --once --driver-package <your package name>
```

You can export `TEST_BROWSER_VISIBLE=1` to show the Electron window while tests run.

### PhantomJS

Support for PhantomJS has been deprecated because it's development is suspended. For more information on why it got suspended, please take a look at [the repository](https://github.com/ariya/phantomjs)

```bash
$ npm i --save-dev phantomjs-prebuilt
$ TEST_BROWSER_DRIVER=phantomjs meteor test --once --driver-package <your package name>
```
