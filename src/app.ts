import "reflect-metadata";
import { AppOptions, LogLevelType } from "./types";
import Sqlite3Logger2 from "./Sqlite3Logger2";
import colors from "colors";
import { IBetterLogLogger } from "./IBetterLogLogger";
import MySqlLogger from "./MySqlLogger";

interface IPersistedLog {
  debug(tags: string[], msg: string): Promise<void>;

  error(tags: string[], msg: string): Promise<void>;

  info(tags: string[], msg: string): Promise<void>;

  log(tags: string[], msg: string): Promise<void>;

  warn(tags: string[], msg: string): Promise<void>;

  time(name: string, tags: string[], msg: string): Promise<void>;

  timeEnd(name: string, tags: string[], msg: string): Promise<void>;
}

class BetterLog implements IPersistedLog {
  private _options: AppOptions;
  private readonly _defaultOptions: AppOptions = {
    appTitle: "BetterLogs",
    dbName: "better-logs.db",
    usePrefix: false,
    silent: [],
    prune: 10,
    useColor: true,
  };
  private readonly _dbLogger: Sqlite3Logger2;
  private _prune: boolean;
  private _useColors: boolean;
  private _defaultSilentSetting:LogLevelType[];
  private readonly _silentAll: LogLevelType[] = ["info", "warn", "debug", "error", "time"];
  private readonly _silentNone: LogLevelType[] = [];
  
  public constructor(options: Partial<AppOptions>) {
    this._options = { ...this._defaultOptions, ...options };
    this._options.silent = this._options.silent === true ?
      [...this._silentAll] :
      this._options.silent === false ? 
        [...this._silentNone] :
        [...this._options.silent];

    // @ts-ignore Intended.
    console.assert(this._options.silent !== false && this._options.silent !== true, "Silent should not be a boolean.");
    
    this._defaultSilentSetting = [...this._options.silent] as LogLevelType[];
    this._dbLogger = new Sqlite3Logger2(this._options.dbName);
    this._prune = false;
    this._useColors = this._options?.useColor || false;
    this._useColors ? colors.enable() : colors.disable();
  }

  protected async persistLog(level: LogLevelType, tags: string[], msg: string): Promise<void> {
    await this._dbLogger.RecordLog({ level, tags, message: msg });


    // Under_Dev: is this causing that SQLIte mis use error?
    // if (this._prune) {
    //   await this._dbLogger.PruneLogs(this._options.prune);
    //   this._prune = false;
    // }
  }
  protected formatTags(tags: string[]): string {
    const tagsString = tags.join(";");
    return `\t[${tagsString}]\t`;
  }

  protected get silentList(): LogLevelType[] {
    if (!this._options.silent) return [];
    return this._options.silent as LogLevelType[];
  }

  public async debug(tags: string[], msg: string) {
    if (!this.silentList.includes("debug")) {
      const message = `DEBUG: ${this.formatTags(tags)} ${msg}`;
      console.log(this._useColors ? colors.grey(message) : message);
    }
    await this.persistLog("debug", tags, msg);
  }

  public async error(tags: string[], msg: string) {
    if (!this.silentList.includes("error")) {
      const message = `ERROR: ${this.formatTags(tags)} ${msg}\t${new Date().toJSON()}]`;
      console.error(this._useColors ? colors.red(message) : message);
    }
    await this.persistLog("error", tags, msg);
  }

  public async log(tags: string[], msg: string) {
    await this.info(tags, msg);
  }

  public async info(tags: string[], msg: string) {
    if (!this.silentList.includes("info")) {
      const message = `INFO: ${this.formatTags(tags)} ${msg}`;
      console.log(this._useColors ? colors.green(message) : message);
    }
    await this.persistLog("info", tags, msg);
  }

  public async warn(tags: string[], msg: string) {
    if (!this.silentList.includes("warn")) {
      const message = `WARN: ${this.formatTags(tags)} ${msg}`;
      console.log(this._useColors ? colors.yellow(message) : message);
    }
    await this.persistLog("warn", tags, msg);
  }

  public async time(name:string, tags: string[], msg: string) {
    if (!this.silentList.includes("time")) {
      const message = `TIME: ${this.formatTags(tags)} ${msg}`;
      console.timeLog(name, this._useColors ? colors.cyan(message) : message);
    }
    // TODO: How to handle this?
    //  Think we need an internal timer or something. Cant' really get it from timeEnd.
    //await this.persistLog("time", tags, msg); //Tiem stamps are in the database.... High enough precision though?
  }
  public async timeEnd(name:string, tags: string[], msg: string) {
    if (!this.silentList.includes("time")) {
      console.timeEnd(name);
      const message = `TIME: ${this.formatTags(tags)} ${msg}`;
      console.log(this._useColors ? colors.cyan(message) : message);
    }
    // TODO: How to handle this?
    //await this.persistLog("time", tags, msg);
  }
  
  public async Close() {
    await this._dbLogger.Close();
  }
}

class BetterLog2 implements IPersistedLog {
  private _options: Omit<AppOptions, "dbName">;
  private readonly _defaultOptions: Omit<AppOptions, "dbName"> = {
    appTitle: "BetterLogs",
    usePrefix: false,
    silent: [],
    prune: 10,
    useColor: true,
  };
  private readonly _dbLogger: IBetterLogLogger;
  private readonly _dbInitPromise: Promise<unknown>;
  private _useColors: boolean;
  private _prune: boolean;
  private _defaultSilentSetting:LogLevelType[];
  private readonly _silentAll: LogLevelType[] = ["info", "warn", "debug", "error", "time"];
  private readonly _silentNone: LogLevelType[] = [];

  public constructor(options: Partial<AppOptions>) {
    this._options = { ...this._defaultOptions, ...options };
    this._options.silent = this._options.silent === true ?
      [...this._silentAll] :
      this._options.silent === false ?
        [...this._silentNone] :
        [...this._options.silent];

    // @ts-ignore Intended.
    console.assert(this._options.silent !== false && this._options.silent !== true, "Silent should not be a boolean.");

    this._defaultSilentSetting = [...this._options.silent] as LogLevelType[];
    this._dbLogger = new MySqlLogger();
    this._dbInitPromise = this._dbLogger.createDatabase();
    this._prune = false;
    this._useColors = this._options?.useColor || false;
    this._useColors ? colors.enable() : colors.disable();
  }

  protected async persistLog(level: LogLevelType, tags: string[], msg: string): Promise<void> {
    await this._dbInitPromise;
    await this._dbLogger.RecordLog({ level, tags, message: msg });
  }
  protected formatTags(tags: string[]): string {
    const tagsString = tags.join(";");
    return `\t[${tagsString}]\t`;
  }

  protected get silentList(): LogLevelType[] {
    if (!this._options.silent) return [];
    return this._options.silent as LogLevelType[];
  }

  public async debug(tags: string[], msg: string) {
    if (!this.silentList.includes("debug")) {
      const message = `DEBUG: ${this.formatTags(tags)} ${msg}`;
      console.log(this._useColors ? colors.grey(message) : message);
    }
    await this.persistLog("debug", tags, msg);
  }

  public async error(tags: string[], msg: string) {
    if (!this.silentList.includes("error")) {
      const message = `ERROR: ${this.formatTags(tags)} ${msg}\t${new Date().toJSON()}]`;
      console.error(this._useColors ? colors.red(message) : message);
    }
    await this.persistLog("error", tags, msg);
  }

  public async log(tags: string[], msg: string) {
    await this.info(tags, msg);
  }

  public async info(tags: string[], msg: string) {
    if (!this.silentList.includes("info")) {
      const message = `INFO: ${this.formatTags(tags)} ${msg}`;
      console.log(this._useColors ? colors.green(message) : message);
    }
    await this.persistLog("info", tags, msg);
  }

  public async warn(tags: string[], msg: string) {
    if (!this.silentList.includes("warn")) {
      const message = `WARN: ${this.formatTags(tags)} ${msg}`;
      console.log(this._useColors ? colors.yellow(message) : message);
    }
    await this.persistLog("warn", tags, msg);
  }

  public async time(name:string, tags: string[], msg: string) {
    if (!this.silentList.includes("time")) {
      const message = `TIME: ${this.formatTags(tags)} ${msg}`;
      console.timeLog(name, this._useColors ? colors.cyan(message) : message);
    }
    // TODO: How to handle this?
    //  Think we need an internal timer or something. Cant' really get it from timeEnd.
    //await this.persistLog("time", tags, msg); //Tiem stamps are in the database.... High enough precision though?
  }
  public async timeEnd(name:string, tags: string[], msg: string) {
    if (!this.silentList.includes("time")) {
      console.timeEnd(name);
      const message = `TIME: ${this.formatTags(tags)} ${msg}`;
      console.log(this._useColors ? colors.cyan(message) : message);
    }
    // TODO: How to handle this?
    //await this.persistLog("time", tags, msg);
  }

  public async Close() {
    await this._dbInitPromise;
    await this._dbLogger.Close();
  }
}



export default BetterLog2;
