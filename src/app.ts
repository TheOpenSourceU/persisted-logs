//
// The entry point.
// We should follow the wiki guide
// at: https://github.com/TheOpenSourceU/persisted-logs/wiki

import { AppOptions, LogLevelType } from "./types";
import colors from "colors";
import QueueBuffer from "./QueueBuffer";
colors.enable();

interface IPersistedLog {
  debug(tags: string[], msg: string): void;
  error(tags: string[], msg: string): void;
  info(tags: string[], msg: string): void;
  warn(tags: string[], msg: string): void;
}

// No async in here. I want this to act as Sync.
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
  private readonly _dbLogger: QueueBuffer;
  //private readonly _pendingPromises: Promise<void>[] = [];

  public constructor(options: Partial<AppOptions>) {
    this._options = {...this._defaultOptions, ...options };
    this._dbLogger = new QueueBuffer(this._options.dbName);
  }

  protected persistLog( level: LogLevelType, tags: string[], msg: string): void {
    this._dbLogger.addLogRecord({level, tags, message: msg});
  }

  public async dispose(reset:boolean = true): Promise<void[]> {
    return await Promise.all(this._dbLogger.getPendingPromises(reset)); //TODO: Finish this.
  }

  public debug(tags: string[], msg: string): void {
    if(!this._options.silent) {
      console.log(`DEBUG: ${tags.join(", ")}: ${msg}`.gray);
    }
    this.persistLog("debug", tags, msg);
  }

  public error(tags: string[], msg: string): void {
    if(!this._options.silent) {
      console.error(`ERROR: ${tags.join(", ")}: ${msg}`.red);
    }
    this.persistLog("error", tags, msg);
  }

  public log(tags: string[], msg: string): void {
    this.info(tags, msg);
  }
  public info(tags: string[], msg: string): void {
    if(!this._options.silent) {
      console.log(`INFO: ${tags.join(", ")}: ${msg}`);
    }
    this.persistLog("info", tags, msg);
  }

  public warn(tags: string[], msg: string): void {
    if(!this._options.silent) {
      console.warn(`WARN: ${tags.join(", ")}: ${msg}`.yellow);
    }
    this.persistLog("info", tags, msg);
  }
}


export default BetterLog;
