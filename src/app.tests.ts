import Logger from './app';
import Sqlite3Logger from "./Sqlite3Logger";

jest.useFakeTimers();
describe("App", () => {
  afterEach(() => {
    jest.runAllTimers();
  });
  afterAll(() => {
    jest.runAllTimers();
  });
  test('basic api', () => {
    Logger.replaceLabel('test');
    Logger.setLogLevel('debug');
    Logger.log('test');
    Logger.qLog('debug', 'test');
    Logger.qLog('info', 'test');
    Logger.qLog('warn', 'test');
    Logger.qLog('error', 'test');
    Logger.clearLogLevel();
    Logger.restoreLabel();
    jest.runAllTimers();

  });
});