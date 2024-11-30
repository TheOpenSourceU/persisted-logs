import BetterLog2 from "./app";


(async function() {
  const bl = new BetterLog2({});
  try {
    await bl.log(['test', 'test', 'test'], 'test');
  } catch(er) {
    const _er = er as Error;
    console.log("one");
    console.log(_er.stack);
    console.log(_er.message);
  }

  try {
    const e = new Error("").stack;
    await bl.log(['test', 'follow-up'], `this is another entry with the stack trace maybe ${e || "[none]"}`);
  } catch(er) {
    const _er = er as Error;
    console.log("two follow up");
    console.log(_er.stack);
    console.log(_er.message);
  }

  await bl.Close();

  process.exit(0);
})();