import { describe } from "node:test";
import Sync from "../Sync";

describe('Sync', () => {

  let spyLog;
  let spyDebug;
  let spyWarn;
  let spyError;

  beforeAll(() => {
    console.time('Sync');
  });
  afterAll(() => {
    console.timeEnd('Sync');
  });
  beforeEach(() => {
    // Step 1: Mock console methods
    spyLog = jest.spyOn(console, 'log').mockImplementation();
    spyDebug = jest.spyOn(console, 'debug').mockImplementation();
    spyWarn = jest.spyOn(console, 'warn').mockImplementation();
    spyError = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    // Step 4: Restore console methods after each test
    jest.restoreAllMocks();
  });


  it('basic', async () => {
    //Intention is a sync test.
    Sync.info('should-not-return-promise', 'basic error');
    expect(spyLog).toHaveBeenCalled();
    expect(spyDebug).not.toHaveBeenCalled();
    expect(spyWarn).not.toHaveBeenCalled();
    expect(spyError).not.toHaveBeenCalled();
    return Promise.resolve();
  })

  it('basic', (done) => {
    //Intention is a sync test.
    try {
      Sync.info('should-not-return-promise', 'basic error');
      expect(spyLog).toHaveBeenCalled();
      expect(spyDebug).not.toHaveBeenCalled();
      expect(spyWarn).not.toHaveBeenCalled();
      expect(spyError).not.toHaveBeenCalled();
    } finally {
      done();
    }
  });

  const d: string[] = [];
  const letterACodeInUtf8 = 65;
  const letterLittleZCodeInUtf8 = 122;
  let currentLetterCode = letterACodeInUtf8;
  //const letterZCodeInUtf8 = 90;

  for(let i = 0; i < 99999; i++) {
    const exampleData = Date.now().toString(32);
    d.push(exampleData);
    // d.push(new Buffer(0).fill(currentLetterCode++));
    // if (currentLetterCode >= letterLittleZCodeInUtf8) {
    //   currentLetterCode = letterACodeInUtf8;
    // }
  }

  let rotate = 0;

  it.each(d)('basic', async (msg) => {
    //Intention is a sync test.
    if (rotate++ === 0) {
      Sync.debug('should-not-return-promise', msg);
      expect(spyLog).not.toHaveBeenCalled();
      expect(spyDebug).toHaveBeenCalled();
      expect(spyWarn).not.toHaveBeenCalled();
      expect(spyError).not.toHaveBeenCalled();
    } else if (rotate++ === 1) {
      Sync.info('should-not-return-promise', msg);
      expect(spyLog).toHaveBeenCalled();
      expect(spyDebug).not.toHaveBeenCalled();
      expect(spyWarn).not.toHaveBeenCalled();
      expect(spyError).not.toHaveBeenCalled();
    } else if (rotate++ === 2) {
      Sync.warn('should-not-return-promise', msg);
      expect(spyLog).not.toHaveBeenCalled();
      expect(spyDebug).not.toHaveBeenCalled();
      expect(spyWarn).toHaveBeenCalled();
      expect(spyError).not.toHaveBeenCalled();
    } else if (rotate++ === 3) {
      Sync.error('should-not-return-promise', msg);
      expect(spyLog).not.toHaveBeenCalled();
      expect(spyDebug).not.toHaveBeenCalled();
      expect(spyWarn).not.toHaveBeenCalled();
      expect(spyError).toHaveBeenCalled();
      rotate = 0;
    }
  }, 100);
});