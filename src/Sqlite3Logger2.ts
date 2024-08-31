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

  private async createDatabase() {
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
  }

  public async RecordLog({level, tags, message}: LogRecordType): Promise<void> {
    try {
      await this.createDatabase();

      if(!message?.trim()) return;

      const tagIds = await this.convertToTagList(tags);

      const params = {
        $level: Sqlite3Logger2.errorLogMap[level],
        $logMessage: message.stripColors,
        $logJson: JSON.stringify({ message: message.replace(`"`, "'") }),
      };

      const sql: string = `
        insert into app_log (level_id, log_message, json_obj)
        values ($level, $logMessage, $logJson);
    `;
      const logEntryResult = await this.executeSql(sql, params, false) as RunResult | false;

      if(logEntryResult !== false) {
        const lastId = logEntryResult?.lastID;
        await this.insertTags(lastId, tagIds);
      }
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
        return runResult;
      }
    } catch(er) {
      console.error(`Error processing db statements \n${sql}\n\n`);
      throw new WrappedError(er as Error, "Error processing db statements");
    } finally {
      // TODO: Determine if this is needed. I think it wasn't
      //  writing to disk without it thought
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

  private async convertToTagList(tags: string[]) {
    if(!tags || tags.length === 0) return [];
    const tagIds: number[] = [];
    for(const tag of tags) {
      const tagId = await this.findTagIdOrCreate(tag);
      if(tagId > -1) {
        tagIds.push(tagId);
      }
    }
    return tagIds;
  }



  private async findTagIdOrCreate(tag: string): Promise<number> {
    if(!tag.trim()) return -1;
    tag = tag.trim().toLowerCase();
    const sql: string = `
      select id from tags where tag = $tag;
    `;
    const result = await this.executeSql<{id:number}>(sql, { $tag: tag }, true) as {id:number}[];
    if(result?.length) {
      return result[0].id;
    }
    return await this.createTag(tag);
  }
  private async createTag(tag: string): Promise<number> {
    if(!tag.trim()) return -1;
    const sql: string = `
      insert into tags (tag) values ($tag);
    `;
    const queryResults = await this.executeSql(sql, { $tag: tag }, false) as RunResult | false;
    if(queryResults !== false) {
      return queryResults?.lastID;
    }
    return -1;
  }


  private async insertTags(lastId: number, tagIds: number[]) {
    if(!tagIds || tagIds.length === 0) return;
    if(!lastId) return;
    const sql: string = `
      insert into log_tags (log_id, tag_id) values ($logId, $tagId);
    `;
    for(const tagId of tagIds) {
      await this.executeSql(sql, { $logId: lastId, $tagId: tagId }, false);
    }
  }
}