//
// The entry point.
// We should follow the wiki guide
// at: https://github.com/TheOpenSourceU/persisted-logs/wiki

import { AppOptions, LogLevelType } from "./types";
import Sqlite3Logger2 from "./Sqlite3Logger2";
import colors from "colors";

interface IPersistedLog {
  debug(tags: string[], msg: string): Promise<void>;

  error(tags: string[], msg: string): Promise<void>;

  info(tags: string[], msg: string): Promise<void>;

  log(tags: string[], msg: string): Promise<void>;

  warn(tags: string[], msg: string): Promise<void>;


  /**
   * During run time, mute the output and just persist it.
   */
  hush(): void;

  /**
   * During run time, unmute the output - log & persist it.
   */
  unhush(): void;
}

class BetterLog implements IPersistedLog {
  private readonly _options: AppOptions;
  private readonly _defaultOptions: AppOptions = {
    appTitle: "BetterLogs",
    dbName: "better-logs.db",
    usePrefix: false,
    silent: false,
    prune: 10,
    useColor: true
  };
  private readonly _dbLogger: Sqlite3Logger2;
  private _prune: boolean;
  private _useColors: boolean;

  public constructor(options: Partial<AppOptions>) {
    this._options = { ...this._defaultOptions, ...options };
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

  public async debug(tags: string[], msg: string) {
    if (this.isNotSilent()) {

      const message = `DEBUG: ${this.formatTags(tags)} ${msg}`;
      console.log(this._useColors ? colors.grey(message) : message);
    }
    await this.persistLog("debug", tags, msg);
  }

  public async error(tags: string[], msg: string) {
    if (this.isNotSilent()) {
      const message = `ERROR: ${this.formatTags(tags)} ${msg}\t${new Date().toJSON()}]`;
      console.error(this._useColors ? colors.red(message) : message);
    }
    await this.persistLog("error", tags, msg);
  }

  public async log(tags: string[], msg: string) {
    await this.info(tags, msg);
  }

  public async info(tags: string[], msg: string) {
    if (this.isNotSilent()) {
      const message = `INFO: ${this.formatTags(tags)} ${msg}`;
      console.log(this._useColors ? colors.green(message) : message);
    }
    await this.persistLog("info", tags, msg);
  }

  public async warn(tags: string[], msg: string) {
    if (this.isNotSilent()) {
      const message = `WARN: ${this.formatTags(tags)} ${msg}`;
      console.log(this._useColors ? colors.yellow(message) : message);
    }
    await this.persistLog("warn", tags, msg);
  }

  /**
   * During run time, mute the output and just persist it.
   */
  public hush() {
    this._options.silent = true;
  }

  /**
   * During run time, unmute the output - log & persist it.
   */
  public unhush() {
    this._options.silent = false;
  }

  // /**
  //  * During run time, mute the output for the
  //  * next message and just persist it.
  //
  // This Concept did not work.
  //  */
  // public hushNext() {
  //   this._hushNext = true;
  // }
  //
  // private isNextHushed(): boolean {
  //   if (this._hushNext) {
  //     this._hushNext = false;
  //     return true;
  //   }
  //   return false;
  // }

  private isNotSilent(): boolean {
    return !(this._options.silent);
  }

  public async Close() {
    await this._dbLogger.Close();
  }
}


export default BetterLog;
