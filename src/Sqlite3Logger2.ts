import { CommonType, DataStoreType, LogLevelType, LogRecordType } from "./types";
import SQL from "./SQL";
import { AsyncDatabase } from "promised-sqlite3";
import { RunResult } from "sqlite3";
import WrappedError from "./WrappedError";

// Under_Dev:
//  this isn't quite working yet. The observed problem is that there
//  is only one message that shows up. everything else seems lost.
//  I'm thinking the problem is my usage of the sqlite3 lib. I'm doing
//  something wrong or it's not working as I expect.
//  -
//  Tried an Async version and, still the same issue... No.
// The problem is mixing of promises and non promises.
//  That just doesn't work as I need. So, lets flip over to a full
// async interface.

/**
 * Logger that logs to a sqlite3 database.
 */
export default class Sqlite3Logger2 {
  private readonly _dbPath: DataStoreType;
  private _db: AsyncDatabase | undefined;
  public constructor(path:DataStoreType = ":memory:") {
    this._dbPath = path;
  }


  private static readonly errorLogMap: { [key in LogLevelType]: number } = {
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
  };

  public async RecordLog({level, tags, message}: LogRecordType): Promise<void> {
    console.log('start RecordLog');
    const _tagsForNow = Array.isArray(tags) ? tags.map(i => i.stripColors.trim()).join(",") : tags.stripColors.trim();

    const params = {
      $level: Sqlite3Logger2.errorLogMap[level],
      $logTag: _tagsForNow,
      $logMessage: message.stripColors,
      $logJson: JSON.stringify({ tag:_tagsForNow, message: message }),
    };

    const sql: string = `
        insert into app_log (level_id, log_tag, log_message, json_obj, created_on, s_created_on)
        values ($level, $logTag, $logMessage, $logJson, current_timestamp, current_timestamp);
    `;

    try {

      const tableExists = await this.executeSql(SQL.stmtLogTableExists);
      if (!tableExists) {
        await this.executeSql(SQL.logTable);
        await this.executeSql(SQL.logLevelTable);
        await this.executeSql(SQL.logTags);
        await this.executeSql(SQL.logTagsTable);
        await this.executeSql(SQL.logLevelData);
      }
      await this.executeSql(sql, params);
    } catch(er) {
      console.error("Error processing db statements");
      console.error(er);
    }
  }

  private async executeSql(sql:string, params?: Record<string, CommonType>): Promise<RunResult | false> {

    if(!sql) {
      return Promise.resolve(false);
    }

      const db = this._db ? this._db : (this._db = await AsyncDatabase.open(this._dbPath));
      //db.inner.on("trace", (sql) => console.log("[TRACE]", sql));

    try {
      return await db.run(SQL.stmtLogTableExists, params);
    } catch(er) {
      throw new WrappedError(er as Error, "Error processing db statements");
    }
  }

  public async PruneLogs(prune: number) {
    const sql: string = `
        delete from main.app_log where created_on < datetime('now', $prune);
    `;
    return await this.executeSql(sql, { $prune: `-${prune} days` });
  }
}