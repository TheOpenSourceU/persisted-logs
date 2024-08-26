// import Sqlite3Logger2 from './Sqlite3Logger2';
// import * as sqlite3 from 'sqlite3';
//
// jest.mock('sqlite3', () => ({
//   Database: jest.fn(),
// }));
//
// describe('Sqlite3Logger2', () => {
//   let logger: Sqlite3Logger2;
//   const dbPath = ':memory:';
//
//   beforeEach(() => {
//     logger = new Sqlite3Logger2(dbPath);
//   });
//
//   it('should record a log message with valid parameters', async () => {
//     const dbRunMock = jest.fn((sql, params, callback) => callback(null));
//     sqlite3.Database.mockImplementation(() => ({
//       serialize: jest.fn((callback) => callback()),
//       run: dbRunMock,
//       exec: jest.fn((sql, callback) => callback()),
//       close: jest.fn(),
//     }));
//
//     await logger.RecordLog('info', 'testTag', 'testMessage');
//
//     expect(dbRunMock).toHaveBeenCalled();
//   });
//
//   it('should handle error when inserting log message', async () => {
//     const dbRunMock = jest.fn((sql, params, callback) => callback(new Error('Insert error')));
//     sqlite3.Database.mockImplementation(() => ({
//       serialize: jest.fn((callback) => callback()),
//       run: dbRunMock,
//       exec: jest.fn((sql, callback) => callback()),
//       close: jest.fn(),
//     }));
//
//     console.error = jest.fn();
//
//     await logger.RecordLog('info', 'testTag', 'testMessage');
//
//     expect(console.error).toHaveBeenCalledWith('Error inserting log message');
//   });
//
//   it('should create tables if they do not exist', async () => {
//     const dbRunMock = jest.fn((sql, params, callback) => callback(null));
//     const dbExecMock = jest.fn((sql, callback) => callback());
//     sqlite3.Database.mockImplementation(() => ({
//       serialize: jest.fn((callback) => callback()),
//       run: dbRunMock,
//       exec: dbExecMock,
//       close: jest.fn(),
//     }));
//
//     await logger.RecordLog('info', 'testTag', 'testMessage');
//
//     expect(dbExecMock).toHaveBeenCalledTimes(5);
//   });
//
//   it('should handle error when processing db statements', async () => {
//     sqlite3.Database.mockImplementation(() => {
//       throw new Error('DB error');
//     });
//
//     console.error = jest.fn();
//
//     await logger.RecordLog('info', 'testTag', 'testMessage');
//
//     expect(console.error).toHaveBeenCalledWith('Error processing db statements');
//   });
// });