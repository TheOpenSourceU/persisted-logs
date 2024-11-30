import BetterLog from '../app';

describe('app.ts', () => {
  jest.useFakeTimers();

  it('should log things', async () => {
    const l = new BetterLog({ dbName: 'unit-test.db', silent: false });
    await l.debug(['test'], 'test');
    await l.error(['test'], 'test');
    await l.info(['test'], 'test');
    await l.warn(['test'], 'test');
  });

  it('should handle dollar signs', async () => {
    const l = new BetterLog({ dbName: 'unit-test.db', silent: false });
    await l.debug(['test'], 'test $');
    await l.error(['test'], 'test $');
    await l.info(['test'], 'test $');
    await l.warn(['test'], 'test $');
  });
});
