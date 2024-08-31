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
    try {
      const tableExists= await this.executeSql<{name:string}>(SQL.stmtLogTableExists, undefined, true) as {name:string}[];
      if (!tableExists?.length) {
        const dbCreationResults: (RunResult | false | unknown[])[] = [];

        dbCreationResults.push(await this.executeSql(SQL.logTable));
        dbCreationResults.push(await this.executeSql(SQL.logLevelTable));
        dbCreationResults.push(await this.executeSql(SQL.logTags));
        dbCreationResults.push(await this.executeSql(SQL.logTagsTable));
        for(const levelSql of SQL.logLevelData) {
          if(!levelSql) continue;
          dbCreationResults.push(await this.executeSql(levelSql));
        }
        const nowShouldExist = await this.executeSql<{name:string}>(SQL.stmtLogTableExists, undefined, true) as {name:string}[];
        if(!nowShouldExist?.length) {
          console.warn('Failed to create log tables.');
        }
      }

      if(!message?.trim()) return;
      const _tagsForNow = Array.isArray(tags) ? tags.map(i => i.stripColors.trim()).join(",") : tags.stripColors.trim();

      const params = {
        $level: Sqlite3Logger2.errorLogMap[level],
        $logTag: _tagsForNow,
        $logMessage: message.stripColors,
        $logJson: JSON.stringify({ tag:_tagsForNow, message: message.replace(`"`, "'") }),
      };

      const sql: string = `
        insert into app_log (level_id, log_tag, log_message, json_obj)
        values ($level, $logTag, $logMessage, $logJson);
    `;
      console.log('RecordLog sql:', sql, params);
      await this.executeSql(sql, params, false);
    } catch(er) {
      console.error(er);
    }
  }

  private async executeSql<T>(sql:string, params?: Record<string, CommonType>, incResults:boolean = false): Promise<RunResult | T[] | false> {

    if(!sql) {
      return Promise.resolve(false);
    }

    const db = this._db ? this._db : (this._db = await AsyncDatabase.open(this._dbPath));
    //db.inner.on("trace", (sql) => console.log("[TRACE]", sql));

    try {
      if(incResults) {
        const d = await db.all<T>(sql, params);
        return d;
      } else {
        const runResult = await db.run(sql, params);
        console.log('runResult', runResult);
        return runResult;
      }
    } catch(er) {
      console.error(`Error processing db statements \n${sql}\n\n`);
      throw new WrappedError(er as Error, "Error processing db statements");
    } finally {
      this._db = undefined;
      await db.close();
    }
  }

  public async PruneLogs(prune: number) {
    // const sql: string = `
    //     delete from main.app_log where created_on < datetime('now', '-100 days');
    // `;
    // return await this.executeSql(sql, { $prune: `-${prune} days` });
    return Promise.resolve(); // Address later.
  }
}