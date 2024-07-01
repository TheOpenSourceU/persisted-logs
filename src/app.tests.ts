import Logger from './app';

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
    Logger.qLog('debug', 'basic api debug test');
    Logger.qLog('info', 'basic api info test');
    Logger.qLog('warn', 'basic api warn test');
    Logger.qLog('error', 'basic api error test');
    Logger.clearLogLevel();
    Logger.restoreLabel();
    jest.runAllTimers();

  });
});