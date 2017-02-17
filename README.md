# aldeed:browser-tests

This package exports a `startBrowser` function for server code, which runs your client tests within a headless browser page. Meteor test driver packages can depend on this package. See the example implementation here: https://github.com/DispatchMe/meteor-mocha

NOTE: This package replaces [dispatch:phantomjs-tests](https://github.com/DispatchMe/meteor-phantomjs-tests). This package supports PhantomJS as well as others, and can be easily updated to support more.

## Usage

In your test driver package `package.js` file, add

```js
api.use('aldeed:browser-tests@0.0.1', 'server');
```

Then in your server code, do something similar to this:

```js
import { startBrowser } from 'meteor/aldeed:browser-tests';

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

### PhantomJS

```bash
$ npm i --save-dev phantomjs-prebuilt
$ TEST_BROWSER_DRIVER=phantomjs meteor test --once --driver-package <your package name>
```

### Selenium ChromeDriver

```bash
$ npm i --save-dev selenium-webdriver chromedriver
$ TEST_BROWSER_DRIVER=chrome meteor test --once --driver-package <your package name>
```

### Nightmare/Electron

```bash
$ npm i --save-dev nightmare
$ TEST_BROWSER_DRIVER=nightmare meteor test --once --driver-package <your package name>
```
