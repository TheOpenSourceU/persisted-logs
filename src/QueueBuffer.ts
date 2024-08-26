import { DataStoreType, LogRecordType } from "./types";
import Sqlite3Logger2 from "./Sqlite3Logger2";

export default class QueueBuffer {
  private buffer: LogRecordType[] = [];
  private promiseBuffer: Promise<void>[] = [];
  private isProcessing = false;
  private dbLogger: Sqlite3Logger2;
  // private readonly cleanUpInterval = 1000;
  // private readonly cleanUp: unknown;
  constructor(path:DataStoreType = ":memory:") {
    this.dbLogger = new Sqlite3Logger2(path);

    // this.cleanUp = setInterval(() => {
    //   //this.pendingPromises = this.pendingPromises.filter(p => p.isPending());
    //   for (const pendingPromise of this.pendingPromises) {
    //      }
    // });
  }

  /**
   * for disposing.
   */
  public getPendingPromises(reset:boolean): Promise<void>[] {
    try {
      return this.promiseBuffer;
    } finally {
      this.promiseBuffer = reset ? [] : this.promiseBuffer;
    }
  }

  public addLogRecord(logRecord: LogRecordType): void {
    this.buffer.push(logRecord);
    this.promiseBuffer.push(this.process());
  }

  private async process(): Promise<void> {
    if(this.isProcessing) return;
    this.isProcessing = true;
    while (this.buffer.length > 0) {
      const item = this.buffer.shift();
      if(item) {
        console.log(`Processing: ${item}`);
        return await this.dbLogger.RecordLog(item);
      }
    }
  }
}