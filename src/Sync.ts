
// Concept. Sync method.

// use queue. Post queue, remove. error put back.
// control queue with then, catch and finally.

import Sqlite3Logger from "./datastore/Sqlite3Logger";
import EventEmitter from "node:events";
import { AppOptions, LogMessageTagType, LogMessageType } from "./types";

function getBetterLog(options?: AppOptions) {
  const db = new Sqlite3Logger(options?.dbName || "better-logs.db", false);
  const pendingLogMessages: LogMessageType[] = [];
  const ee = new EventEmitter<any>();
  let locked = false;

  ee.on('process_queue', () => {
    if(locked) return;
    locked = true;
    try {
      const msg = pendingLogMessages.shift();
      if (msg) {
        const reportFailureToAlternate = (err: unknown | Error | Object) => {
          //pendingLogMessages.unshift(msg);
          ee.emit('save_failed', msg, err);
        };
        msg.tags = Array.isArray(msg.tags) ? msg.tags : [msg.tags];
        switch (msg.level) {
          case 'debug':
            db.Debug(msg.tags.join(","), msg.msg).then(() => {
              ee.emit('process_queue');
            }).catch(reportFailureToAlternate);
            break;
          case 'info':
            db.Info(msg.tags.join(","), msg.msg).then(() => {
              ee.emit('process_queue');
            }).catch(reportFailureToAlternate);
            break;
          case 'warn':
            db.Warn(msg.tags.join(","), msg.msg).then(() => {
              ee.emit('process_queue');
            }).catch(reportFailureToAlternate);
            break;
          default:
            db.Log('info', msg.tags.join(","), msg.msg)
              .catch(reportFailureToAlternate);
            break;
        }
      }
    } finally {
      locked = false;
    }
  });

  let counterForInfo = 1;
  function processLog(message:LogMessageType) {
    const {tags, msg,level } = message;
    pendingLogMessages.push({tags, msg, level: level || 'info'});
    ee.emit('process_queue', counterForInfo++);
  }
  ee.on('save_failed', (msg: LogMessageType, err: unknown | Error | Object) => {
    console.error('Error saving log message', msg, err);
    pendingLogMessages.unshift(msg);
  });

  const d = {
    debug: function(tags:LogMessageTagType, msg:string): void {
      processLog({tags, msg, level: 'debug'});
      // pendingLogMessages.push({tag, msg, level: 'debug'});
      // ee.emit('process_queue');
    },
    info: function(tags:LogMessageTagType, msg:string) {
      processLog({tags, msg, level: 'info'});
    },
    warn: function(tags:LogMessageTagType, msg:string) {
      processLog({tags, msg, level: 'warn'});
    },
    error: function(tags:LogMessageTagType, msg:string) {
      processLog({tags, msg, level: 'error'});
    }
  };
  return d;
}

const betterLog = getBetterLog();
export default betterLog;
export { betterLog as BetterLog };
