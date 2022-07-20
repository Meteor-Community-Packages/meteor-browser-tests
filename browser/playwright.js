/**
 * All browser drivers must do the following things:
 * - Open a page to ROOT_URL
 * - send all console messages to the stdout function
 * - send all errors to the stderr function, only when window.testsAreRunning is false
 * - When window.testsDone becomes true, call `done` with window.testFailures argument
 * - As a safeguard, exit with code 2 if there hasn't been console output
 *   for 30 seconds.
 */

 // map of playwright console types to their node counterpart
 const consoleMap = {
   'warning' : 'warn',
   'startGroup' : 'group',
   'endGroup' : 'groupEnd',
 };
 
 export default function startPlaywright({
   stdout,
   stderr,
   done,
 }) {
   let playwright;
   try {
     playwright = require('playwright');
   } catch (error) {
     console.error(error);
     throw new Error(
       'When running app tests with TEST_BROWSER_DRIVER=playwright, you must first ' +
       '"meteor npm i --save-dev playwright"'
     );
   }
 
   async function runTests() {
     const browser = await playwright.chromium.launch();
     console.log(await browser.version());
     const page = await browser.newPage();
 
     // emitted when the page crashes
     page.on('error', (err) => {
       console.warn('The page has crashed.', err);
     });
 
     // console message args come in as handles, use this to evaluate them all
     page.on('console', async msg => {
       let msgType = msg.type();
 
       // unknown console types are mapped or become a warning with addl context
       if(consoleMap[msgType]) {
         msgType = consoleMap[msgType];
       }
       else if(typeof console[msgType] === "undefined") {
         msgType = 'warn';
         console.warn(`UNKNOWN CONSOLE TYPE: ${msgType}`);
       }
 
       console[msgType](...await Promise.all(msg.args().map(arg => arg.jsonValue())));
     });
 
     await page.goto(process.env.ROOT_URL);
 
     await page.waitForFunction(() => window.testsDone, { timeout: 0 });
     const testFailures = await page.evaluate('window.testFailures');
 
     await page.close();
     await browser.close();
 
     done(testFailures);
   }
 
   runTests();
 }
 