import Sqlite3Logger from "./datastore/Sqlite3Logger";

// export type BetterLog = {
//   debug(tag: string, msg: string): Promise<void>;
//   info(tag: string, msg: string): Promise<void>;
//   warn(tag: string, msg: string): Promise<void>;
//   error(tag: string, msg: string): Promise<void>;
// };


function getBetterLog() {
  const db = new Sqlite3Logger('log.db', false);
  //void db.Debug('BetterLogs', 'Bootstrapped');
  // const d = {
  //   async debug(tag:string, msg:string) {
  //     return db.Debug(tag, msg);
  //   },
  //   async info(tag:string, msg:string) {
  //     return db.Info(tag, msg);
  //   },
  //   async warn(tag:string, msg:string) {
  //     return db.Warn(tag, msg);
  //   },
  //   async error(tag:string, msg:string) {
  //     return db.Error(tag, msg);
  //   }
  // };
  const d = {
    debug: async function(tag:string, msg:string) {
      return db.Debug(tag, msg);
    },
    info: async function(tag:string, msg:string) {
      return db.Info(tag, msg);
    },
    warn: async function(tag:string, msg:string) {
      return db.Warn(tag, msg);
    },
    error: async function(tag:string, msg:string) {
      return db.Error(tag, msg);
    }
  };
  return d;
}

const betterLog = getBetterLog();
export default betterLog;
export { betterLog as BetterLog };