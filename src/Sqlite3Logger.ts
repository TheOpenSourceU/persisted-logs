import * as sqlite3 from "sqlite3";
import {LogLevelType} from "./types";
import {RunResult} from "sqlite3";


export default class Sqlite3Logger {
  private readonly _database: sqlite3.Database;
  private readonly path: string;

  public constructor(path:string, verbose:boolean) {
    this.path = path || ':memory:';
    verbose = verbose || false;

    const sl = verbose ? sqlite3.verbose() : sqlite3;
    this._database = new sl.Database(this.path);
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


  public async Bootstrap() {
    const sql: string = `
        CREATE TABLE IF NOT EXISTS 'log' (
           id INTEGER PRIMARY KEY AUTOINCREMENT,
           log_level TEXT,
           log_label TEXT,
           json TEXT,
           created_at DATE
        );
    `;
    await this.run(sql);
  }

  public async Log(level: LogLevelType, label:string, message: string) {
    const sql:string = `INSERT INTO log (log_level, log_label, json, created_at) VALUES ('${level}', '${label}', '${message}', datetime('now'))`;
    await this.run(sql);
  }
}