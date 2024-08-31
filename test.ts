import BetterLog from "./src/app";


(async function() {
  const bl = new BetterLog({ dbName:"unit-test-2.db",silent: false });
  try {
    await bl.info(['test'], 'This is an info message.');

    await bl.debug(['debug','test'], 'This is a debug message');
    await bl.error(['test', 'error'], 'This is an error message. it gets highlighted as an error');

    await bl.warn(['test', 'warn'], 'This is a warning message. it gets highlighted as a warning');
  } catch (er) {
    const _null = "[null]";
    console.error(er?.toString() || _null);
    await bl.error([], er?.toString() || _null);
  }
})();