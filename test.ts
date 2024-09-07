import BetterLog from "./src/app";


(async function() {
  const bl = new BetterLog({ dbName: "unit-test-2.db", silent: false });
  try {
    await bl.info(["demo", "test", "alina"], `This is an info message. ${Date.now()}`);

    await bl.debug(["demo", "debug", "test", "Alina"], "This is a debug message");
    await bl.error(["demo", "test", "error", " ALL_TAGS_ARE_NORMALIZED_TO_lowercase"], `This is an error message. it gets ${Date.now()} highlighted as an error`);

    await bl.warn(["demo", "test", "warn", "spaces are ok"], `This is a warning message. it gets highlighted as a warning ${Date.now()}`);
  } catch (er) {
    const _null = "[null]";
    console.error(er?.toString() || _null);
    await bl.error([], er?.toString() || _null);
  }

  try {
    bl.hush();
    await bl.info(["demo", "hush test", "hush-test"], `This is the hush demo. When you hush, it silences all output to the console. If you call hushNext(), it will only silence the next log message.`);
    await bl.debug(["demo", "hush test", "hush-test"], "The hush method will continue across all log levels until you call unhush().");
    await bl.error(["demo", "hush test", "hush-test"], "This includes error messages. Again, all of these still go to the persistent log.");
    bl.unhush();
    await bl.info(["demo", "hush test", "hush-test", "unhush"], `Since Unhush has been called, this will go to the console.`);
  } catch (er) {
    const _null = "[null]";
    console.error(er?.toString() || _null);
    await bl.error([], er?.toString() || _null);
  }

  try {
    const loops = 99999;
    let hushToggle = false
    for(let i = 0; i < loops; i++) {
      if(i % 1000 === 0) {
        hushToggle = !hushToggle;
        if(hushToggle) {
          bl.hush();
        } else {
          bl.unhush();
        }
      }
      await bl.debug(["demo", "loop-test"], `Loop test ${i} of ${loops} (${i/loops}) ${hushToggle}`);
    }
  } catch (er) {
    const _null = "[null]";
    console.error(er?.toString() || _null);
    await bl.error([], er?.toString() || _null);
  }
})();