import { fork } from 'node:child_process';

export default function startPlaywright({ done }) {
  // Use worker to avoid bug with Meteor fibers
  // see: https://github.com/meteor/meteor/issues/12158
  const cwd = process.env.PWD;
  const child = fork(Assets.absoluteFilePath('browser/playwright_worker.mjs'), {
    stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
    cwd,
    detached: false,
  });
  child.on('message', ({ kind, data }) => {
    switch (kind) {
      case 'testsDone':
        done(data.testFailures);
        break;
      default:
        console.warn(`Unknown message kind: ${kind}`);
    }
  });
  child.send('runTests');
}
