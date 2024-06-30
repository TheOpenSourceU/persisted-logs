import Logger from './app';
import Sqlite3Logger from "./Sqlite3Logger";

describe("App", () => {
    test("should work", () => {
        expect(true).toBe(true);
    });

    test('driver test', async () => {
      const sql = new Sqlite3Logger("db.sqlite", true);

      await sql.Bootstrap();
      await sql.Log('info', 'test', Date.now().toString(16));
      //await sql.Log('info', 'test', {"test": "this is a test", now: Date.now()});

    })

    test('basic api', async () => {
      Logger.replaceLabel('test');
      Logger.setLogLevel('debug');
      Logger.log('test');
      Logger.qLog('debug', 'test');
      Logger.qLog('info', 'test');
      Logger.qLog('warn', 'test');
      Logger.qLog('error', 'test');
      Logger.clearLogLevel();
      Logger.restoreLabel();
    })
});