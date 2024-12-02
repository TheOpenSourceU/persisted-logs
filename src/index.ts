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

  const outputAll = async (n: number = 0) => {
    try {
      await bl.info(["test", "info", "outputAll", `outputAll-${n}`], `This is an info ${n}`);
      await bl.warn(["test", "warn", "outputAll", `outputAll-${n}`], `This is a warning ${n}`);
      await bl.error(["test", "error", "outputAll", `outputAll-${n}`], `This is an error ${n}`);
      await bl.debug(["test", "debug", "outputAll", `outputAll-${n}`], `This is a debug ${n}`);
      await bl.log(["test", "log", "outputAll"], `This is a log ${n}`);
    } catch (er) {
      const _er = er as Error;
      console.log(`two follow up ${n}`);
      console.log(_er.stack);
      console.log(_er.message);
    }
  };

  await outputAll(-1);



  try {
    for (let i = 0; i < 100; i++) {
      await outputAll(i);
    }
  } catch(er) {
    const _er = er as Error;
    console.log("two follow up");
    console.log(_er.stack);
    console.log(_er.message);
  }

  await bl.Close();

  process.exit(0);
})();