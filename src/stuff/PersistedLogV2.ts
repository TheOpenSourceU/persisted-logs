import colors from "colors";
import type { AppOptions, LogLevelType, LogRecordType } from "../types";
import MySqlLogger from "./MySqlLogger";
import { _PersistedLog } from "./_PersistedLog";
import { IPersistedLog } from "./IPersistedLog";
import { IDBLogger } from "./IDBLogger";


export class PersistedLogV2 extends _PersistedLog implements IPersistedLog {
  private readonly _dbLogger: IDBLogger;
  private readonly _dbInitPromise: Promise<unknown>;
  private _bootstrapped: boolean;
  private readonly _baseTags: string[];

  public constructor(options: Partial<AppOptions>) {
    super(options);
    this._bootstrapped = false;
    this._dbLogger = new MySqlLogger();
    this._dbInitPromise = this._dbLogger.createDatabase(this._options);

    this._baseTags = [this.constructor.name, this._options.appTitle];
  }

  protected async bootstrapDatabase() {
    await this._dbInitPromise;
    if(this._bootstrapped) return;
    this._bootstrapped = true;
    await this._dbLogger.createDatabase(this._options);
    const data = {
      level: "debug",
      tags: ['internal', 'bootstrapDatabase', ...this._baseTags],
      message: "bootstrapDatabase completed."
    } as LogRecordType;
    await this._dbLogger.RecordLog(data);



    // TODO: Log the App Name. // this._options.appTitle
  }

  protected async persistLog(level: LogLevelType, tags: string[], msg: string): Promise<void> {
    await this.bootstrapDatabase();
    await this._dbLogger.RecordLog({ level, tags: [...tags, ...this._baseTags], message: msg });
  }

  protected formatTags(tags: string[]): string {
    const tagsString = tags.join(";");
    return `\t[${tagsString}]\t`;
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
    return await this.persistLog("info", tags, msg);
  }

  public async warn(tags: string[], msg: string) {
    if (!this.silentList.includes("warn")) {
      const message = `WARN: ${this.formatTags(tags)} ${msg}`;
      console.log(this._useColors ? colors.yellow(message) : message);
    }
    return await this.persistLog("warn", tags, msg);
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
    await this.bootstrapDatabase();
    await this._dbLogger.Close();
  }
}
