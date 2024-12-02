import { CommonType, DataStoreType, LogLevelType, LogRecordType } from "./types";
import SQL from "./stuff/SQL";
import { AsyncDatabase } from "promised-sqlite3";
import { RunResult } from "sqlite3";
import WrappedError from "./WrappedError";
import { IDBLogger } from "./stuff/IDBLogger";

/**
 * Logger that logs to sqlite3 database.
 */
export default class Sqlite3Logger2 implements IDBLogger {
  private readonly _dbPath: DataStoreType;
  private _db: AsyncDatabase | undefined;
  
  public constructor(path: DataStoreType = ":memory:") {
    this._dbPath = path;
  }

  private static readonly errorLogMap: { [key in LogLevelType]: number } = {
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    time: 5
  };

  async createDatabase() {
    const tableExists = await this.executeSql<{ name: string }>(SQL.stmtLogTableExists, undefined, true) as {
      name: string
    }[];
    if (!tableExists?.length) {
      const dbCreationResults: (RunResult | false | unknown[])[] = [];

      dbCreationResults.push(await this.executeSql(SQL.logTable));
      dbCreationResults.push(await this.executeSql(SQL.logLevelTable));
      dbCreationResults.push(await this.executeSql(SQL.logTags));
      dbCreationResults.push(await this.executeSql(SQL.logTagsTable));
      for (const levelSql of SQL.logLevelData) {
        if (!levelSql) continue;
        dbCreationResults.push(await this.executeSql(levelSql));
      }
      const nowShouldExist = await this.executeSql<{ name: string }>(SQL.stmtLogTableExists, undefined, true) as {
        name: string
      }[];
      if (!nowShouldExist?.length) {
        console.warn("Failed to create log tables.");
      }
    }
  }

  async RecordLog({ level, tags, message }: LogRecordType): Promise<void> {
    try {
      if (!message || !message.trim()) return; //TODO: verify bug fix. 

      await this.createDatabase();

      const params = {
        $level: Sqlite3Logger2.errorLogMap[level],
        $logMessage: message,
        $logJson: JSON.stringify({ level, message: message.replace(`"`, "'"), "created": new Date().toJSON() })
      };

      const sql: string = `
          insert into app_log (level_id, log_message, json_obj)
          values ($level, $logMessage, $logJson);
      `;
      const logEntryResult = await this.executeSql(sql, params, false) as RunResult | false;

      if (logEntryResult !== false) {
        const lastId = logEntryResult?.lastID;
        if (lastId === undefined) {
          console.error("Failed to get last id from log entry.");
          return;
        }
        await this.insertTags2(lastId, tags);
      }
    } catch (er) {
      throw new WrappedError(er as Error, "Error recording log");
    }
  }

  /**
   * Execute a SQL statement.
   * @param sql
   * @param params
   * @param incResults
   * @private
   */
  private async executeSql<T>(sql: string, params?: Record<string, CommonType>, incResults: boolean = false): Promise<RunResult | T[] | false> {
    if (!sql.trim()) {
      return Promise.resolve(false);
    }

    try {
      this._db = this._db || await AsyncDatabase.open(this._dbPath);

      if (incResults) {
        const d = await this._db.all<T>(sql, params);
        return d;
      } else {
        const runResult = await this._db.run(sql, params);
        return runResult;
      }
    } catch (er) {
      await this._db?.close();
      this._db = await AsyncDatabase.open(this._dbPath);

      console.error(`Error (${er}) processing db statements \n${sql}\n\n`);
      throw new WrappedError(er as Error, "Error processing db statements");
    } finally {
      // // TODO: Determine if this is needed. I think it wasn't
      // //  writing to disk without it though.
      // await this._db?.close();
      // this._db = undefined;
    }
  }

  async Close() {
    const db = this._db;
    this._db = undefined;
    if (db) await db.close();
  }

  async PruneLogs(prune: number) {
    const sql: string = `
        delete
        from main.app_log
        where created_on < datetime('now', $prune);
    `;
    return await this.executeSql(sql, { $prune: `-${prune} hours` });
  }

  async convertToTagList(tags: string[]) {
    const tagIds: Set<number> = new Set<number>();
    if (!tags || tags.length === 0) return tagIds;

    for (const tag of tags) {
      const tagId = await this.findTagIdOrCreate(tag);
      if (tagId > -1) {
        tagIds.add(tagId);
      }
    }
    return tagIds;
  }


  async findTagIdOrCreate(tag: string): Promise<number> {
    if (!tag.trim()) return -1;
    tag = tag.trim().toLowerCase();

    const sql: string = `
        select id
        from tags
        where tag = $tag
        order by id;
    `;
    const result = await this.executeSql<{ id: number }>(sql, { $tag: tag }, true) as { id: number }[];
    if (result?.length) {
      return result[0].id;
    }
    return await this.createTag(tag);
  }

  async createTag(tag: string): Promise<number> {
    if (!tag.trim()) return -1;
    const sql: string = `
        insert into tags (tag)
        values ($tag);
    `;
    const queryResults = await this.executeSql(sql, { $tag: tag }, false) as RunResult | false;
    if (queryResults !== false) {
      return queryResults?.lastID;
    }
    return -1;
  }

  private async insertTags2(lastId: number, tags: string[]) {
    if (!tags || tags.length === 0) return;
    if (!lastId) return;
    
    const tagIds = await this.convertToTagList(tags);
    const sql: string = `
        insert into log_tags (log_id, tag_id)
        values ($logId, $tagId);
    `;
    for (const tagId of tagIds) {
      await this.executeSql(sql, { $logId: lastId, $tagId: tagId }, false);
    }
  }
}