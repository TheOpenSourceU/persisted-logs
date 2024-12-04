import type { AppOptions, LogRecordType } from '../types';

/** Database Logger Interface */
export interface IDBLogger {
  createDatabase(options: Partial<AppOptions>): Promise<void>;

  RecordLog({ level, tags, message }: LogRecordType): Promise<void>;

  Close(): Promise<void>;

  PruneLogs(prune: number): Promise<any[] | false>;

  convertToTagList(tags: string[]): Promise<Set<number>>;

  findTagIdOrCreate(tag: string): Promise<number>;

  createTag(tag: string): Promise<number>;
}
