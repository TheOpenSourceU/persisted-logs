
export type LogLevelType = "warn" | 'info' | 'error' | 'debug';
export type DataStoreType = ":memory:" | "app-log.db" | string;

export type AppOptions = {
  defaultLabel?: string;
  defaultLogLevel?: LogLevelType;
  dbPath?:string; // default is __dirname + '/logs'
  dataStore?: DataStoreType;
}

export type AppInterface = {
  // setLabel: (label: string) => void;
  // clearLabel: () => void;

  setLogLevel: (level: LogLevelType) => void;
  clearLogLevel: () => void;

  replaceLabel: (lbl:string) => void;
  restoreLabel: () => void;

  log: (message: string) => void;
  qLog: (ll: LogLevelType, message: string) => void;
  qLabelLog: (ll: LogLevelType, label: string, message: string) => void;
}