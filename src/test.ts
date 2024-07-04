import FastSqlite3Logger from "./datastore/FastSqlite3Logger";

async function test() {
  const d = Date.now().toString(32);
  const f = new FastSqlite3Logger(`logs-${d}.db`, true);

  await f.wait();

  f.setLogLevel('debug');

  f.Debug('debug-testing', 'this is a debug test');
  f.Info('info-testing', 'this is an info test');

  f.Error('error-testing', 'this is an error test');
  f.Warn('warn-testing', 'this is a warn test');

  await f.wait();
}

test().finally(() => { console.log('done'); });

// const d = Date.now().toString(32);
// const f = new FastSqlite3Logger(`logs-${d}.db`, true);
//
// f.setLogLevel('debug');
//
// f.Debug('debug-testing', 'this is a debug test');
// f.Info('info-testing', 'this is an info test');
//
// f.Error('error-testing', 'this is an error test');
// f.Warn('warn-testing', 'this is a warn test');
//
// f.wait().then(() => {
//   console.log('done');
// }).catch((err) => {
//   console.error(err);
// });
