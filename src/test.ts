import Sqlite3Logger from "./datastore/Sqlite3Logger";

async function test() {
  const d = "001";
  const f = new Sqlite3Logger(`logs-${d}.db`, true);

  f.setLogLevel('debug');

  for(let i = 0; i < 10000000; i++) {
    const p = [
      f.Info(`db-file`, `logs-${d}.db`),
      f.Debug('debug-testing', `[${i}] this is a debug test`),
      f.Info('info-testing', `[${i}] this is an info test`),
      f.Error('error-testing', `[${i}] this is an error test`),
      f.Warn('warn-testing', `[${i}] this is a warn test`)
    ];
    await Promise.all(p);
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
