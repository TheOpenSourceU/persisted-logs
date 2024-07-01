import { LogLevelType } from "../types";

export interface ILoggerDatastore {
  Bootstrap(): Promise<void> | void;

  /**
   * Records the log to the database.
   * @param level
   * @param label
   * @param message
   * @constructor
   */
  Log(level: LogLevelType, label: string, message: string): Promise<void>|void;
}
