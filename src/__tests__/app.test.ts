import BetterLog from "../app";


describe('app.ts', () => {
  jest.useFakeTimers();

  it('should be able to run tests', () => {
    expect(true).toBe(true);
  });

  it('should log things', async () => {
    const l = new BetterLog({ dbName:"unit-test.db",silent: false });

    l.debug(['test'], 'test');
    l.error(['test'], 'test');
    l.info(['test'], 'test');
    l.warn(['test'], 'test');

    await l.dispose(true);
  });

});