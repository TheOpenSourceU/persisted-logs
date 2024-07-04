import { LogLevelType } from "../types";

export interface ILoggerDatastore {
  /**
   * Records the log to the database.
   * @param level
   * @param label
   * @param message
   * @constructor
   */
  Log(level: LogLevelType, label: string, message: string): void;

  Warn(label: string, message: string): void;
  Info(label: string, message: string): void;
  Error(label: string, message: string): void;
  Debug(label: string, message: string): void;

  wait(): Promise<void>;
}
