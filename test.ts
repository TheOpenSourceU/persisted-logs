import BetterLog from "./src/app";


const bl = new BetterLog({ dbName:"unit-test.db",silent: false });

(async function() {

  bl.info(['test'], 'This is an info message.');


  bl.debug(['test'], 'This is a debug message');
  bl.error(['test'], 'This is an error message. it gets highlighted as an error');

  bl.warn(['test'], 'This is a warning message. it gets highlighted as a warning');

  await bl.dispose(true);
})();