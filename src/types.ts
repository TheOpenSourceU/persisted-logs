export type CommonType = string | number | boolean | undefined;
//export type CommonTypes = Record<string, CommonType> | CommonType[];

export type LogLevelType = "warn" | "info" | "error" | "debug" | "time";
export type DataStoreType = ":memory:" | string;

export type AppOptions = {
  appTitle: string;

  /** @deprecated */
  dbName?: string;

  usePrefix: boolean;
  useColor: boolean;

  /**
   * If silent is true, then it will not log anything.
   * Otherwise skip the levels that are in the array.
   */
  silent: boolean | LogLevelType[];

  prune: number; // TODO: Restricted to positive number; intended is age of record but what scale??
}

export type LogRecordType = {
  level: LogLevelType;
  tags: string[];
  message: string;
}