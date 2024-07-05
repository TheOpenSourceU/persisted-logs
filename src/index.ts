import Sqlite3Logger from "./datastore/Sqlite3Logger";

export type BetterLog = { debug(tag: string, msg: string): Promise<void>; info(tag: string, msg: string): Promise<void>; warn(tag: string, msg: string): Promise<void>; error(tag: string, msg: string): Promise<void>; }

let obj: BetterLog;
export default function () {
  const db = new Sqlite3Logger('log.db', false);
  void db.Debug('BetterLogs', 'Bootstrapped');
  if(obj) return obj;
  return (obj = {
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
  });
}