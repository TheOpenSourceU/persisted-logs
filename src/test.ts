import Sqlite3Logger from "./datastore/Sqlite3Logger";

async function test() {
  const d = Date.now().toString(32);
  const f = new Sqlite3Logger(`logs-${d}.db`, true);

  f.setLogLevel('debug');

  for(let i = 0; i < 1000; i++) {
    await f.Info(`db-file`, `logs-${d}.db`)
    await f.Debug('debug-testing', `[${i}] this is a debug test`);
    await f.Info('info-testing', `[${i}] this is an info test`);

    await f.Error('error-testing', `[${i}] this is an error test`);
    await f.Warn('warn-testing', `[${i}] this is a warn test`);
  }
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
