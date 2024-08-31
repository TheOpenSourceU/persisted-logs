import BetterLog from "./src/app";


(async function() {
  const bl = new BetterLog({ dbName:"unit-test-2.db",silent: false });
  try {
    await bl.info(['test', 'alina'], `This is an info message. ${Date.now()}`);

    await bl.debug(['debug','test', 'Alina'], 'This is a debug message');
    await bl.error(['test', 'error', ' spaces-And-caps-SHOULD-be-lower-case'], `This is an error message. it gets ${Date.now()}` +
      ' highlighted as an' +
      ' error');

    await bl.warn(['test', 'warn', 'spaces are ok'], `This is a warning message. it gets highlighted as a warning ${Date.now()}`);
  } catch (er) {
    const _null = "[null]";
    console.error(er?.toString() || _null);
    await bl.error([], er?.toString() || _null);
  }
})();