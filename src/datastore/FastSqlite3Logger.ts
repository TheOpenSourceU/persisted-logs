import { ILoggerDatastore } from "./ILoggerDatastore";
import * as sqlite3 from "sqlite3";
import fs from 'fs';

export default class FastSqlite3Logger implements ILoggerDatastore {
  private readonly _database: sqlite3.Database;
  private readonly path: string;
  private readonly table = 'log';
  private readonly logErrorFile = `error-${Date.now().toString(16)}.log`;
  private readonly createTableSQL: string = `CREATE TABLE IF NOT EXISTS ${this.table} (
           id INTEGER PRIMARY KEY AUTOINCREMENT,
           log_level TEXT,
           log_label TEXT,
           json TEXT,
           created_at DATE
        );`;
  private readonly insertSql: string = `
    INSERT INTO log (log_level, log_label, json, created_at) 
    VALUES ($level, $label, $json, datetime('now'))`;

  public constructor(path:string, verbose:boolean) {
    this.path = path || ':memory:';
    verbose = verbose || false;

    const sl = verbose ? sqlite3.verbose() : sqlite3;
    this._database = new sl.Database(this.path, (err) => {
      if(err)
        throw err;
    });
  }

  public Log(level: string, label: string, message: string): void {
    const backup = this.appendMessageToFile.bind(this);
    const params = {
      $level: level,
      $label: label,
      $json: message
    };
    this._database.run(this.insertSql, params, (err) => {
      if(!err) return;
      backup(JSON.stringify(params));
    });
  }
  public Bootstrap(): void {
    const backup = this.appendMessageToFile.bind(this);
    this._database.run(this.createTableSQL, (err) => {
      if(!err) return;
      backup(err?.message || "")
    });
    return;
  }

  protected appendMessageToFile(message: string): void {
    function cb() {
      // Can't really do anything about it anyway.
    }
    fs.appendFile(this.logErrorFile, message + '\n', cb);
  }
}