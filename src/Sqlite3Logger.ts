import * as sqlite3 from "sqlite3";
import { RunResult } from "sqlite3";
import { LogLevelType } from "./types";
import { ILoggerDatastore } from "./datastore/ILoggerDatastore";

export default class Sqlite3Logger implements ILoggerDatastore {
  private readonly _database: sqlite3.Database;
  private readonly path: string;
  private readonly table = 'log';
  private readonly createTableSQL: string = `CREATE TABLE IF NOT EXISTS ${this.table} (
           id INTEGER PRIMARY KEY AUTOINCREMENT,
           log_level TEXT,
           log_label TEXT,
           json TEXT,
           created_at DATE
        );`;
  private readonly insertSql: string = `INSERT INTO log (log_level, log_label, json, created_at) VALUES ('%level%', '%level%', '%message%', datetime('now'))`;

  public constructor(path:string, verbose:boolean) {
    this.path = path || ':memory:';
    verbose = verbose || false;

    const sl = verbose ? sqlite3.verbose() : sqlite3;
    this._database = new sl.Database(this.path, (err) => {
      if(err) throw err;
    });
  }

  protected async run(sql: string): Promise<RunResult> {
    return await new Promise((resolve, reject) => {
      this._database.run(sql, function (err) {
        if(err) reject(err);
        resolve(this);
      });
    });
  }

  protected async get<T>(sql: string): Promise<T[]> {
    return await new Promise((resolve, reject) => {
      this._database.all(sql, (er, rows: T[]) => {
        if(er) reject(er);
        resolve(rows);
      });
    });
  }


  async Bootstrap() {
    await this.run(this.createTableSQL);
  }

  /**
   * Records the log to the database.
   * @param level
   * @param label
   * @param message
   * @constructor
   */
  async Log(level: LogLevelType, label: string, message: string) {
    const sql: string = String(this.insertSql)
      .replace(/%level%/g, level)
      .replace(/%message%/g, message)
      .replace(/%label%/g, label);
    await this.run(sql);
  }
}