import { ILoggerDatastore } from "./ILoggerDatastore";

export default class SyncSqlite3Logger implements ILoggerDatastore {
  Log(level: string, label: string, message: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  Bootstrap(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}