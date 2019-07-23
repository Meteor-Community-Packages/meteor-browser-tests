# Changelog

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
