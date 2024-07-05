import Sqlite3Logger from "./datastore/Sqlite3Logger";

export default function () {
  const db = new Sqlite3Logger('log.db', false);

  return {
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
}