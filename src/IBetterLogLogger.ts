import { LogRecordType } from "./types";
import { RunResult } from "sqlite3";

export interface IBetterLogLogger {
  createDatabase(): Promise<void>;

  RecordLog({ level, tags, message }: LogRecordType): Promise<void>;

  Close(): Promise<void>;

  PruneLogs(prune: number): Promise<RunResult | any[] | false>;

  convertToTagList(tags: string[]): Promise<Set<number>>;

  findTagIdOrCreate(tag: string): Promise<number>;

  createTag(tag: string): Promise<number>;
}