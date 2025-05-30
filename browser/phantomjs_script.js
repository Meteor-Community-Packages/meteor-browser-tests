const page = require('webpage').create()
const system = require('system')

let lastOutput = new Date()
page.onConsoleMessage = (message) => {
	lastOutput = new Date()
	console.log(message)
}

page.onError = (msg, trace) => {
	const testsAreRunning = page.evaluate(() => window.testsAreRunning)
	if (testsAreRunning) return
	console.error(msg)
	for (const item of trace) {
		console.error(`    ${item.file}: ${item.line}`)
	}
	// We could call phantom.exit here, but sometimes there are benign client errors
	// and the tests still load and run fine. So instead there is a safeguard in the
	// setInterval to exit if nothing happens for awhile.
}

// Meteor will call the `runTests` function exported by the driver package
// on the client as soon as this page loads.
page.open(system.env.ROOT_URL)

setInterval(() => {
	const done = page.evaluate(() => window.testsDone)
	if (done) {
		const failures = page.evaluate(() => window.testFailures)
		// We pass back the number of failures as the exit code
		return phantom.exit(failures)
	}

	// As a safeguard, we will exit if there hasn't been console output for
	// 30 seconds.
	if (new Date() - lastOutput > 30000) {
		phantom.exit(2)
	}
}, 500)
