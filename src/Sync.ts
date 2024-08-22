
// Concept. Sync method.

// use queue. Post queue, remove. error put back.
// control queue with then, catch and finally.

import Sqlite3Logger from "./datastore/Sqlite3Logger";
import EventEmitter from "node:events";

type LogMessageType = {
  tag: string,
  msg: string,
  level: string
};

function getBetterLog() {
  const db = new Sqlite3Logger('log.db', false);
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
        switch (msg.level) {
          case 'debug':
            db.Debug(msg.tag, msg.msg).then(() => {
              ee.emit('process_queue');
            }).catch(reportFailureToAlternate);
            break;
          case 'info':
            db.Info(msg.tag, msg.msg).then(() => {
              ee.emit('process_queue');
            }).catch(reportFailureToAlternate);
            break;
          case 'warn':
            db.Warn(msg.tag, msg.msg).then(() => {
              ee.emit('process_queue');
            }).catch(reportFailureToAlternate);
            break;
          default:
            db.Log('info', msg.tag, msg.msg)
              .catch(reportFailureToAlternate);
            break;
        }
      }
    } finally {
      locked = false;
    }
  });

  let counterForInfo = 1;
  function theBehaviorIsAlwaysTheSame(message:LogMessageType) {
    const {tag, msg,level } = message;
    pendingLogMessages.push({tag, msg, level: level || 'info'});
    ee.emit('process_queue', counterForInfo++);
  }
  // ee.on('save_failed', (msg: LogMessageType, err: unknown | Error | Object) => {
  //   console.log('Error saving log message', msg, err);
  //   pendingLogMessages.unshift(msg);
  // });

  const d = {
    debug: function(tag:string, msg:string): void {
      theBehaviorIsAlwaysTheSame({tag, msg, level: 'debug'});
      // pendingLogMessages.push({tag, msg, level: 'debug'});
      // ee.emit('process_queue');
    },
    info: function(tag:string, msg:string) {
      theBehaviorIsAlwaysTheSame({tag, msg, level: 'info'});
    },
    warn: function(tag:string, msg:string) {
      theBehaviorIsAlwaysTheSame({tag, msg, level: 'warn'});
    },
    error: function(tag:string, msg:string) {
      theBehaviorIsAlwaysTheSame({tag, msg, level: 'error'});
    }
  };
  return d;
}

const betterLog = getBetterLog();
export default betterLog;
export { betterLog as BetterLog };
