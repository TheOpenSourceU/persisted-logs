import { LogLevelType } from "../types";

/** Interface to represent some console.* methods which are persisted. */
export interface IPersistedLog {
  /** get the silent list; supports changes. */
  get silentList(): LogLevelType[];

  debug(tags: string[], msg: string): Promise<void>;

  error(tags: string[], msg: string): Promise<void>;

  info(tags: string[], msg: string): Promise<void>;

  log(tags: string[], msg: string): Promise<void>;

  warn(tags: string[], msg: string): Promise<void>;

  time(name: string, tags: string[], msg: string): Promise<void>;

  timeEnd(name: string, tags: string[], msg: string): Promise<void>;
}