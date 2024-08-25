
// Concept. Sync method.

// use queue. Post queue, remove. error put back.
// control queue with then, catch and finally.

import Sqlite3Logger from "./datastore/Sqlite3Logger";
import EventEmitter from "node:events";
import { AppOptions, BetterLogInstance, LogLevelType, LogMessageTagType, LogMessageType } from "./types";
import colors from "colors";
colors.enable();

function getBetterLog(options?: AppOptions): BetterLogInstance {
  const {silent, prune, useColor, dbName} = {silent: false, prune:10, useColor:true, ...options};

  const db = new Sqlite3Logger(dbName || "better-logs.db", false);
  const pendingLogMessages: LogMessageType[] = [];
  const ee = new EventEmitter<any>();
  let locked = false;

  if(!useColor) {
    colors.disable();
  }

  ee.on('process_queue', () => {
    if(locked) return;
    locked = true;
    try {
      const msg = pendingLogMessages.shift();
      if (msg) {
        const reportFailureToAlternate = (err: unknown | Error | Object) => {
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

      // should this be wrapped in a setImmediate?
      if(pendingLogMessages.length > 0) {
        setImmediate(() => ee.emit('process_queue'));
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
    _logToConsole('error', 'better-logs', 'Error saving log message');
    pendingLogMessages.unshift(msg);
  });

  function _logToConsole(level: LogLevelType, tag: string, message: string): void {
    if(silent) return;
    switch (level) {
      case "error":
        console.error(`${level} [${tag}]: ${message}`.red);
        break;
      case "warn":
        console.warn(`${level} [${tag}]: ${message}`.yellow.bold);
        break;
      case "debug":
        console.debug(`${level} [${tag}]: ${message}`.dim);
        break;
      default:
        console.log(`${level} [${tag}]: ${message}`.black);
    }
  }

  // Under_Dev: it'd probably be better for the console.log calls to be done
  //  rather than in the Sqlite3Logger class. Output would be more immediate.
  const d = {
    debug: function(tags:LogMessageTagType, msg:string): void {
      const tagsArray = Array.isArray(tags) ? tags : [tags];
      _logToConsole('debug', tagsArray.join(","), msg);
      processLog({tags, msg, level: 'debug'});
    },
    info: function(tags:LogMessageTagType, msg:string) {
      const tagsArray = Array.isArray(tags) ? tags : [tags];
      _logToConsole('info', tagsArray.join(","), msg);
      processLog({tags, msg, level: 'info'});
    },
    warn: function(tags:LogMessageTagType, msg:string) {
      const tagsArray = Array.isArray(tags) ? tags : [tags];
      _logToConsole('warn', tagsArray.join(","), msg);
      processLog({tags, msg, level: 'warn'});
    },
    error: function(tags:LogMessageTagType, msg:string) {
      const tagsArray = Array.isArray(tags) ? tags : [tags];
      _logToConsole('error', tagsArray.join(","), msg);
      processLog({tags, msg, level: 'error'});
    }
  };
  return d;
}

const betterLog = getBetterLog();
export default betterLog;
export { betterLog as BetterLog };
