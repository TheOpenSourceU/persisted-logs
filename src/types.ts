
export type LogLevelType = "warn" | 'info' | 'error' | 'debug';
export type DataStoreType = ":memory:" | "app-log.db" | string;

export type AppOptions = {
  dbName: string;
  usePrefix: boolean;
  useColor: boolean;
  silent: boolean;
  appTitle: string;
  prune: number; // Restricted to positive number
}

export type LogMessageTagType = string[] | string;

export type LogMessageType = {
  tags: LogMessageTagType,
  msg: string,
  level: string
};