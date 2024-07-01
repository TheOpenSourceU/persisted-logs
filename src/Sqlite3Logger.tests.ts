import Sqlite3Logger from "./Sqlite3Logger";

jest.useFakeTimers()

describe('Sqlite3Logger', () => {
  const sql = new Sqlite3Logger("db.sqlite", true);
  const loops = 1000;

  beforeAll(async () => {
    await sql.Bootstrap();
    jest.advanceTimersByTime(1000);
  });
  afterEach(() => {
    //jest.advanceTimersByTime(1000);
    jest.runAllTimers();
  });
  afterAll(() => {
    jest.runAllTimers();
  })

  test('basic log test', async () => {
    await sql.Log('info', 'test', Date.now().toString(16));
  });

  test('rapid logging - info', async () => {

    let promises: Promise<void>[] = [];
    for(let i = 0; i < loops; i++){
      promises.push(sql.Log('info', `label-${i}`, Date.now().toString(16)));
      if(promises.length > 10) {
        await Promise.all(promises);
        promises = [];
      }
    }
    await Promise.all(promises);
  });

  test('rapid logging - warn', async () => {
    let promises: Promise<void>[] = [];
    for(let i = 0; i < loops; i++){
      promises.push(sql.Log('warn', `label-${i}`, Date.now().toString(16)));
      if(promises.length > 10) {
        await Promise.all(promises);
        promises = [];
      }
    }
    await Promise.all(promises);
    promises = [];
  });

  test('rapid logging - debug', async () => {
    let promises: Promise<void>[] = [];
    for(let i = 0; i < loops; i++){
      promises.push(sql.Log('debug', `label-${i}`, Date.now().toString(16)));
      if(promises.length > 10) {
        await Promise.all(promises);
        promises = [];
      }
    }
    await Promise.all(promises);
    promises = [];
  });

  test.skip('rapid logging - error', async () => {
    let promises: Promise<void>[] = [];
    for(let i = 0; i < loops; i++){
      promises.push(sql.Log('error', `label-${i}`, Date.now().toString(16)));
      if(promises.length > 10) {
        await Promise.all(promises);
        promises = [];
      }
    }
    await Promise.all(promises);
  });
});