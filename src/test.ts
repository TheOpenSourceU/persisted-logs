import BetterLog from "./app";
import EventEmitter from "node:events";

// Delete the test db.
import fs from "fs";
const dbPath = ["./unit-test-3.db", "./no-close.db"];
for (const path of dbPath) {
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  }
}

(async function() {
  const bl = new BetterLog({ dbName: "unit-test-3.db", silent: false });
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
    const ee = new EventEmitter();
    ee.on("tick", () => {
      try {
        bl.warn(["tick", "warn"], `event emmiter tick log `).catch(er => console.error(er?.toString()));
      } catch (er) {
        console.error(er?.toString());
      }
    });
    const loops = 9999;
    let hushToggle = false;
    for (let i = 0; i < loops; i++) {
      ee.emit("tick");
      if (i % 100 === 0) {
        hushToggle = !hushToggle;
        if (hushToggle) {
          bl.hush();
        } else {
          bl.unhush();
        }
      }
      await bl.debug(["demo", "loop-test"], `Loop test ${i} of ${loops} (${i / loops}) ${hushToggle}`);
    }
  } catch (er) {
    const _null = "[null]";
    console.error(er?.toString() || _null);
    await bl.error([], er?.toString() || _null);
  }

  await bl.Close();
})();


(async function() {
  const bl = new BetterLog({ dbName: "no-close.db", silent: false });

  try {
    const ee = new EventEmitter();
    ee.on("tick", () => {
      try {
        bl.warn(["tick", "warn", "no-close"], `'no-close' event emmiter tick log `).catch(er => console.error(er?.toString()));
      } catch (er) {
        console.error(er?.toString());
      }
    });
    const loops = 9999;
    let hushToggle = false;
    for (let i = 0; i < loops; i++) {
      ee.emit("tick");
      if (i % 100 === 0) {
        hushToggle = !hushToggle;
        if (hushToggle) {
          bl.hush();
        } else {
          bl.unhush();
        }
      }
      await bl.debug(["demo", "loop-test", "no-close"], `no-close Loop test ${i} of ${loops} (${i / loops}) ${hushToggle}`);
    }
  } catch (er) {
    const _null = "[null]";
    console.error(er?.toString() || _null);
    await bl.error([], er?.toString() || _null);
  }

  //What happens if we do not close?
  //await bl.Close();
})();