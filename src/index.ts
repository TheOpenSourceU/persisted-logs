import BetterLog2 from "./app";


(async function() {
  const bl = new BetterLog2({});
  await bl.log(['test', 'test', 'test'], 'test');
  // The log outputs.
  //. then this.


  const e = new Error("").stack;
  await bl.log(['test', 'follow-up'], `this is another entry with the stack trace maybe ${e || "[none]"}`);


  await bl.Close();

  process.exit(0);
})();