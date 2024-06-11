Package.describe({
  name: 'meteortesting:browser-tests',
  summary:
    'A helper package for Meteor test driver packages. Runs client tests in a headless browser.',
  git: 'https://github.com/Meteor-Community-Packages/meteor-browser-tests.git',
  version: '1.6.0-rc300.0',
  testOnly: true,
});

Package.onUse((api) => {
  api.versionsFrom(['2.8.0', '3.0-rc.2'])
  api.use('ecmascript');

  api.mainModule('server.js', 'server');
  api.addAssets(
    ['browser/phantomjs_script.js', 'browser/playwright_worker.mjs'],
    'server'
  );
});
