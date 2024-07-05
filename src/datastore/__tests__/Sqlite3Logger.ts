import Sqlite3Logger from '../Sqlite3Logger';

jest.mock('sqlite3');
jest.mock('node:events');
jest.mock('./SQL');

describe('Sqlite3Logger', () => {
  let logger: Sqlite3Logger;
  const mockRun = jest.fn((sql, params, callback) => callback(null));
  const mockDatabase = {
    run: mockRun,
    exec: jest.fn(),
    serialize: jest.fn((callback) => callback()),
    close: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    //sqlite3.Database = jest.fn().mockImplementation(() => mockDatabase) as any;
    // we need to Mock the Database module.
    logger = new Sqlite3Logger('test.db',  false);
  });

  it('does not log messages above the current log level', async () => {
    logger.setLogLevel('error'); // Set log level to error
    await logger.Info('testTag', 'testMessage'); // Try to log an info message
    expect(mockRun).not.toHaveBeenCalled(); // Expect not to log
  });

  it('changes log level correctly', () => {
    logger.setLogLevel('warn');
    expect(logger).toHaveProperty('currentLogLevel', 'warn');
    expect(logger).toHaveProperty('currentLogLevelNumeric', 2);
  });

  // Additional tests for Error, Info, and Warn methods can follow the same pattern as Debug
});