# Changelog

## 1.7.0
Add: Compatibility with Meteor 3.0

## 1.6.0

Add: Playwright driver now accepts any of the available Playwright modules. [PR](https://github.com/Meteor-Community-Packages/meteor-browser-tests/pull/56)
Add: `ecmascript` package update to v0.16.0

## 1.5.3

Reviewed all drivers and added support for the latest browser versions that are supported for Node 14.

## 1.5.2

Fix: Support for Selenium 4.x

## 1.5.1

Fix: Playwright client not terminating after client tests

## 1.5.0

Add: Set PLAYWRIGHT_BROWSER to use different Playwright browser. Defaults to 'chromium'.

## 1.4.2

Fix: playwright test driver was failing

## 1.4.1

Fix: util is not defined in puppeteer.js

## 1.4.0

Fix: using puppeteer with output files
Fix: Use documented API for console message type
Add: TEST_BROWSER_DRIVER=playwright

## 1.3.5

Nightmare: Increased default `waitTimeout` to 20 days
Browser puppeteer replace deprecated page.waitFor with page.waitForFunction
Updated package ecmascript dependency

## 1.3.4

Nightmare: Fixed calling `console.log()` with more than one parameter

## 1.3.3

Nightmare: Add env var to change timeout for wait() (#27 - @bolaum)

## 1.3.2

Puppeteer: Fixed calling `console.warn()` crashing by "console[msg._type] is not a function" (#26 - @robraux)

## 1.3.1

Nightmare: Make sure message is always a string before split (#24 - @Floriferous)

## 1.3.0

Puppeteer: Fixed evaluation of console-messages

## 1.2.0

Better fix for puppeteer closing the browser before all console-statements were evaluated
Give out `stdout:` console messages, needed for reporters writing to a file - now available as `option.writebuffer()`

## 1.1.0

Set timeout for tests on puppeteer to 0 (infinite)
Removed explicit closing of page to avoid "WebSocket is closed before the connection is established." error
Added `TEST_CHROME_ARGS` to add arguments to chrome-command

## 1.0.0

Breaking: Chrome driver now runs headless unless you set `TEST_BROWSER_VISIBLE=1`

## 0.2.0

Added new experimental `TEST_BROWSER_DRIVER` option, `puppeteer`
