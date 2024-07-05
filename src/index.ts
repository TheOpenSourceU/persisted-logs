import Sqlite3Logger from "./datastore/Sqlite3Logger";

export type BetterLog = {
  debug(tag: string, msg: string): Promise<void>;
  info(tag: string, msg: string): Promise<void>;
  warn(tag: string, msg: string): Promise<void>;
  error(tag: string, msg: string): Promise<void>;
};


function getBetterLog() {
  const db = new Sqlite3Logger('log.db', false);
  void db.Debug('BetterLogs', 'Bootstrapped');
  const d: BetterLog = {
    async debug(tag:string, msg:string) {
      return db.Debug(tag, msg);
    },
    async info(tag:string, msg:string) {
      return db.Info(tag, msg);
    },
    async warn(tag:string, msg:string) {
      return db.Warn(tag, msg);
    },
    async error(tag:string, msg:string) {
      return db.Error(tag, msg);
    }
  };
  return d;
}

const betterLog = getBetterLog();
export default betterLog;