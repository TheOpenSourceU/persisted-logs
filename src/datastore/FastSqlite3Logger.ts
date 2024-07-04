import { ILoggerDatastore } from "./ILoggerDatastore";
import * as sqlite3 from "sqlite3";
import * as fs from "node:fs";
import { LogLevelType } from "../types";
import SQL from './SQL';
import EventEmitter from "node:events";

/**
 * Engine to store the data log term.
 */
export default class FastSqlite3Logger implements ILoggerDatastore {
  private readonly _database: sqlite3.Database;
  private readonly path: string;
  private readonly ee: EventEmitter;
  private _bootstrapped: boolean = false;
  private pendingPromises: Promise<void>[] = [];
  private logLevel: LogLevelType = 'info';
  private logLevelNumeric: number = 3;

  private readonly errorLogMap: { [key in LogLevelType]: number } = {
    'error': 1,
    'warn': 2,
    'info': 3,
    'debug': 4
  };

  public constructor(path:string, verbose:boolean) {
    this.ee = new EventEmitter();
    this.path = path || ':memory:';
    verbose = verbose || false;
    this._bootstrapped = false;

    const sl = verbose ? sqlite3.verbose() : sqlite3;
    this._database = new sl.Database(this.path, (err) => {
      if(err) {
        this.ee.emit('error', err);
        throw err;
      }
    });
    this.Bootstrap();
  }

  private Bootstrap(): void {
    if(this._bootstrapped) return;

    this.ee.on('error', (err) => {
      try {
        const jsonError = err ? JSON.stringify(err) : false;
        if(jsonError === false) return;
        const error = `Error: ${err?.message || jsonError}\n`;
        fs.appendFileSync('BetterLogs-failsafe.log', error);
      } catch(er) {}
    });

    // Do a promise and append it.
    const pending = new Promise<void>((resolve, reject) => {
      this._database.run(`${SQL.logTable} ${SQL.logLevel} ${SQL.logLevelData}`, (err) => {
        if(!err) {
          this._bootstrapped = true;
          resolve();
        } else {
          this._bootstrapped = false;
          this.ee.emit('error', err);
          reject(err);
        }
      });
    });
    this.pendingPromises.push(pending);
  }

  private waitForBootstrap() {
    return new Promise<void>((resolve, reject) => {
      const intervalId = setInterval(() => {
        console.log('waiting for bootstrap', this._bootstrapped);
        try {
          if(this._bootstrapped) {
            clearInterval(intervalId);
            resolve();
            console.log('_bootstrapped!');
          }
        } catch(err) {
          console.log('_bootstrapped rejected');
          reject(err);
        }
      }, 200);
    });
  }

  public Log(level: LogLevelType, tag: string, message: string): void {
    if(!message) return;
    tag = tag || "";
    if(!this._bootstrapped) {
      this.waitForBootstrap().then(() => {
        this.Log(level, tag, message);
      }).catch((err) => {
        this.ee.emit('error', err);
      });
      return;
    }

    const params = {
      $level: this.errorLogMap[level],
      $logTag: tag,
      $logMessage: message,
      $logJson: JSON.stringify({tag, message})
    };

    const sql: string = `
        insert into app_log (level_id, log_tag, log_message, json_obj)
        values ($level, $log_tag, $logMessage, $logJson);
    `;

    // const sqlSimple: string = `
    //     insert into app_log (level_id, log_tag, log_message, json_obj)
    //     values (${this.errorLogMap[level]}, '${tag}', '${tag}', '{}');
    // `;
    // console.log(sqlSimple, params);
    const p = new Promise<void>((resolve, reject) => {
      this._database.run(sql, params, (err) => {
        if(!err) {
          resolve();
        } else {
          this.ee.emit('error', err);
          reject(err);
        }
      });
    });
    this.pendingPromises.push(p)
  }

  public Debug(tag: string, message: string): void {
    this.Log('debug', tag, message);
  }

  public Error(tag: string, message: string): void {
    this.Log('error', tag, message);
  }

  public Info(tag: string, message: string): void {
    this.Log('info', tag, message);
  }

  public Warn(tag: string, message: string): void {
    this.Log('warn', tag, message);
  }

  /**
   * Set the log level. Anything at or below the level will be logged.
   * @param level
   */
  public setLogLevel(level: LogLevelType): void {
    this.logLevel = level;
    this.logLevelNumeric = this.errorLogMap[level];
  }

  public async wait(): Promise<void> {
    await this.waitForBootstrap();
    await Promise.all(this.pendingPromises);
    let len = 0;
    do {
      console.log('waiting for promises', this.pendingPromises.length);
      len = this.pendingPromises.length;
      await Promise.all(this.pendingPromises);
    } while(len !== this.pendingPromises.length);
    this.pendingPromises = [];
  }
}