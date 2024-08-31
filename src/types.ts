
export type CommonType = string | number | boolean | undefined;
//export type CommonTypes = Record<string, CommonType> | CommonType[];

export type LogLevelType = "warn" | 'info' | 'error' | 'debug';
export type DataStoreType = ":memory:" | string;

export type AppOptions = {
  dbName: string;
  usePrefix: boolean;
  useColor: boolean;
  silent: boolean;
  appTitle: string;
  prune: number; // Restricted to positive number
}

export type LogMessageTagType = string[] | string;

export type LogRecordType = {
  level: LogLevelType;
  tags: LogMessageTagType;
  message: string;
}