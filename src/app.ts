//
// The entry point.
// We should follow the wiki guide
// at: https://github.com/TheOpenSourceU/persisted-logs/wiki

import { AppOptions, LogLevelType } from "./types";
import colors from "colors";
import Sqlite3Logger2 from "./Sqlite3Logger2";
colors.enable();

interface IPersistedLog {
  debug(tags: string[], msg: string): Promise<void>;
  error(tags: string[], msg: string): Promise<void>;
  info(tags: string[], msg: string): Promise<void>;
  log(tags: string[], msg: string): Promise<void>;
  warn(tags: string[], msg: string): Promise<void>;
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

  public constructor(options: Partial<AppOptions>) {
    this._options = {...this._defaultOptions, ...options };
    this._dbLogger = new Sqlite3Logger2(this._options.dbName);
    this._prune = true;
  }

  protected async persistLog( level: LogLevelType, tags: string[], msg: string): Promise<void> {
    await this._dbLogger.RecordLog({level, tags, message: msg});

    if(this._prune) {
      await this._dbLogger.PruneLogs(this._options.prune);
      this._prune = false;
    }
  }

  public async debug(tags: string[], msg: string) {
    if(!this._options.silent) {
      console.log(`DEBUG: ${tags.join(", ")}: ${msg}`.gray);
    }
    await this.persistLog("debug", tags, msg);
  }

  public async error(tags: string[], msg: string) {
    if(!this._options.silent) {
      console.error(`ERROR: ${tags.join(", ")}: ${msg}`.red);
    }
    await this.persistLog("error", tags, msg);
  }

  public async log(tags: string[], msg: string) {
    await this.info(tags, msg);
  }

  public async info(tags: string[], msg: string) {
    if(!this._options.silent) {
      console.log(`INFO: ${tags.join(", ")}: ${msg}`);
    }
    await this.persistLog("info", tags, msg);
  }

  public async warn(tags: string[], msg: string) {
    if(!this._options.silent) {
      console.warn(`WARN: ${tags.join(", ")}: ${msg}`.yellow);
    }
    await this.persistLog("warn", tags, msg);
  }
}


export default BetterLog;
