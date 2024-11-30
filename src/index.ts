import BetterLog2 from "./app";


(async function() {
  const bl = new BetterLog2({});
  await bl.log(['test', 'test', 'test'], 'test');
  // The log outputs.
  //. then this.

  await bl.Close();

  process.exit(0);
})();