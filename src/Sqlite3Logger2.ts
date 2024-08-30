import { DataStoreType, LogLevelType, LogRecordType } from "./types";
import SQL from "./SQL";
import { AsyncDatabase } from "promised-sqlite3";

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

    console.log('opening db...');
    const db = this._db ? this._db : (this._db = await AsyncDatabase.open(this._dbPath));
    //db.inner.on("trace", (sql) => console.log("[TRACE]", sql));

    console.log('checking db...');
    try {
      const tableExists = await db.run(SQL.stmtLogTableExists);
      if (!tableExists) {
        console.log('need to create the db');
        await db.run(SQL.logTable);
        await db.run(SQL.logLevelTable);
        await db.run(SQL.logTags);
        await db.run(SQL.logTagsTable);
        await db.run(SQL.logLevelData);
        console.log('created...');
      }
      console.log('running main sql...');
      await db.run(sql, params);
    } catch(er) {
      console.error("Error processing db statements");
      console.error(er);
    } finally {
      // console.log('closing db...');
      // await db.close();
    }
  }
}