import FastSqlite3Logger from "./FastSqlite3Logger";

describe('FastSqlite3Logger', () => {
  const db = new FastSqlite3Logger(':memory:', true);

  test('bootstraps as expected', () => {
    db.Bootstrap();
  });

  test('logs as expected', () => {
    db.Log('info', 'root', 'test');
  });

  test('logs very, very fast', () => {
    for(let i = 0; i < 10000; i++){
      db.Log('info', 'root', `test-${i}-${i.toString(32)}`);
    }
  });
});