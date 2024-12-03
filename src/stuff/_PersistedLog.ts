import { IPersistedLog } from "./IPersistedLog";
import { AppOptions, LogLevelType } from "../types";
import colors from "colors";

export abstract class _PersistedLog implements IPersistedLog {
  protected _prune: boolean;
  protected _useColors: boolean;
  protected _defaultSilentSetting: LogLevelType[];

  protected readonly _silentAll: Readonly<LogLevelType[]> = ["info", "warn", "debug", "error", "time"];
  protected readonly _silentNone: Readonly<LogLevelType[]> = [];
  public static readonly SilentAll: Readonly<LogLevelType[]> = ["info", "warn", "debug", "error", "time"];

  protected _options: AppOptions;
  protected readonly _defaultOptions: AppOptions = {
    appTitle: "BetterLogs",
    dbName: "better-logs.db",
    usePrefix: false,
    silent: [],
    prune: 10,
    useColor: true
  };

  protected constructor(options: Partial<AppOptions>) {
    this._options = { ...this._defaultOptions, ...options };
    this._options.silent = this._options.silent === true ?
      [...this._silentAll] :
      this._options.silent === false ?
        [...this._silentNone] :
        [...this._options.silent];

    // @ts-ignore Intended.
    console.assert(this._options.silent !== false && this._options.silent !== true, "Silent should not be a boolean.");

    this._defaultSilentSetting = [...this._options.silent] as LogLevelType[];

    this._prune = false;
    this._useColors = this._options?.useColor || false;
    this._useColors ? colors.enable() : colors.disable();
  }

  public get silentList(): LogLevelType[] {
    if (!this._options.silent) return [];
    return this._options.silent as LogLevelType[];
  }

  abstract debug(tags: string[], msg: string): Promise<void>;

  abstract error(tags: string[], msg: string): Promise<void>;

  abstract info(tags: string[], msg: string): Promise<void>;

  abstract log(tags: string[], msg: string): Promise<void>;

  abstract time(name: string, tags: string[], msg: string): Promise<void>;

  abstract timeEnd(name: string, tags: string[], msg: string): Promise<void>;

  abstract warn(tags: string[], msg: string): Promise<void>;
}