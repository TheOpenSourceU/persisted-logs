import * as sqlite3 from "sqlite3";
import { LogLevelType } from "../types";
import SQL from "./SQL";
import EventEmitter from "node:events";
import colors from "colors";
colors.enable();

//Should the etnire thing be static for easyn ess??
/**
 * Engine to store the data log term.
 */
export default class Sqlite3Logger {
  private static path: string = ":memory:";
  private static readonly errorLogMap: { [key in LogLevelType]: number } = {
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
  };
  private static ee: EventEmitter = new EventEmitter();

  private _database?: sqlite3.Database;
  private readonly _dbPromise: Promise<sqlite3.Database>;
  private currentLogLevel: LogLevelType;
  private currentLogLevelNumeric: number;

  public constructor(path: string, verbose: boolean) {
    if (path) Sqlite3Logger.path = path;
    if (!Sqlite3Logger.path) {
      Sqlite3Logger.path = ":memory:";
    }
    this.currentLogLevelNumeric = 4;
    this.currentLogLevel = "debug";
    const sl = verbose ? sqlite3.verbose() : sqlite3;
    this._dbPromise = new Promise<sqlite3.Database>((resolve, reject) => {
      const db = new sl.Database(Sqlite3Logger.path, (err) => {
        if (err) {
          reject(err);
        }
        db.serialize(() => {
          db.exec(SQL.logTable, () => {
            console.log("log table created");
          });
          db.exec(SQL.logLevelTable, () => {
            console.log("log level table created");
          });
          db.exec(SQL.logLevelData, () => {
            console.log("log level created");
            resolve(db);
          });
        });
      });
    });
  }



  protected async isReady(): Promise<boolean> {
    try {
      if (!this._database) this._database = await this._dbPromise;
      return !!this._database;
    } catch(er) {
      Sqlite3Logger.ee.emit("error", er);
      console.error('Could not bootstrap the database, it seems')
      throw er; // At this point, we can never return true.
    }
  }

  public async Log(
    level: LogLevelType,
    tag: string,
    message: string,
  ): Promise<void> {
    if (!message?.trim()) return;
    if (Sqlite3Logger.errorLogMap[level] > this.currentLogLevelNumeric) return;

    await this.isReady();

    tag = tag || "";
    const params = {
      $level: Sqlite3Logger.errorLogMap[level],
      $logTag: tag.stripColors,
      $logMessage: message.stripColors,
      $logJson: JSON.stringify({ tag, message: message }),
    };

    const sql: string = `
        insert into app_log (level_id, log_tag, log_message, json_obj, created_on, s_created_on)
        values ($level, $logTag, $logMessage, $logJson, current_timestamp, current_timestamp);
    `;

    await new Promise<void>((resolve, reject) => {
      this._database!.run(sql, params, (err) => {
        if (!err) {
          resolve();
        } else {
          Sqlite3Logger.ee.emit("error", err);
          reject(err);
        }
      });
    });
  }

  public async Debug(tag: string, message: string): Promise<void> {
    await this.Log("debug", tag, message);
  }

  public async Error(tag: string, message: string): Promise<void> {
    await this.Log("error", tag, message);
  }

  public async Info(tag: string, message: string): Promise<void> {
    await this.Log("info", tag, message);
  }

  public async Warn(tag: string, message: string): Promise<void> {
    await this.Log("warn", tag, message);
  }

  /**
   * Set the log level. Anything at or below the level will be logged.
   * @param level
   */
  public setLogLevel(level: LogLevelType): void {
    this.currentLogLevel = level;
    this.currentLogLevelNumeric = Sqlite3Logger.errorLogMap[level];
  }
}
