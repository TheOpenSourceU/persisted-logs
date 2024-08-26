
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

export type LogMessageType = {
  tags: LogMessageTagType,
  msg: string,
  level: string
};
export type BetterLogInstance = {
  debug: (tags: LogMessageTagType, msg: string) => void;
  error: (tags: LogMessageTagType, msg: string) => void;
  info: (tags: LogMessageTagType, msg: string) => void;
  warn: (tags: LogMessageTagType, msg: string) => void;
}
export type LogRecordType = {
  level: LogLevelType;
  tags: LogMessageTagType;
  message: string;
}