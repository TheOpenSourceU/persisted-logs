import { DataSource } from "typeorm";
import { RunResult } from "sqlite3";
import { IDBLogger } from "./stuff";
import type { AppOptions, LogRecordType } from "./types";
import { TypeOrmDataSource } from "./orm/TypeOrmDataSource"
import { Log, Tag, LogLevel, App } from "./orm/entity";

export default class MySqlLogger implements IDBLogger {
  // @ts-ignore Intended
  private _db: DataSource;
  // @ts-ignore Intended
  private _logLevels: LogLevel[];
  private readonly _currentApp: App;

  public constructor() {
    this._currentApp = new App();
    this._logLevels = [];
  }
  public async Close(): Promise<void> {
    await this._db.destroy();
    return;
  }

  public async PruneLogs(prune: number): Promise<false | any[] | RunResult> {
    return Promise.resolve(false);
  }

  public async RecordLog({ level, tags, message }: LogRecordType): Promise<void> {
    console.time('start of transaction RecordLog');

    await this._db.manager.transaction(async () => {

      const currentTagCount = async () => await this._db.manager.count(Tag);
      const currentLogCount = async () => await this._db.manager.count(Log);

      console.log('currentTagCount', await currentTagCount());
      console.log('currentLogCount', await currentLogCount());

      const tagsList: Tag[] = [];
      const tagIdSet = new Set<number>();
      for (const tag of tags) {
        const t = await this._findTagIdOrCreate(tag);
        if(t && !tagIdSet.has(t.id)) {
          tagsList.push(t);
          tagIdSet.add(t.id);
        }
      }

      const data = {
        message,
        tags: tagsList,
        logLevel: this._logLevels.find(itm => itm.level === level) as LogLevel,
        createdOn: new Date()
      };
      console.log('data', data);
      const inserted = await this._db.manager.insert(Log, data);
      console.debug("inserted", inserted);
    });
    console.debug("end of transaction RecordLog");
    console.timeEnd('start of transaction RecordLog');
  }

  public async createTag(tag: string): Promise<number> {
    return await this.findTagIdOrCreate(tag);
  }


  public async convertToTagList(tags: string[]): Promise<Set<number>> {
    const tagIds = new Set<number>();
    for(const tag of tags) {
      const _tag = (tag ?? "").trim().toLowerCase();
      if(_tag) {
        const generatedTagId = await this.createTag(_tag);
        if(tagIds.has(generatedTagId)) {
          console.warn(`duplicate tag id? ${generatedTagId}`);
        }
        tagIds.add(generatedTagId);
      }
    }
    return tagIds;
  }

  private async ensureLogLevels() {
    const logLevels = await this._db.manager.find(LogLevel);
    if(logLevels.length === 0) {
      // LogLevelType
      const defaultLogLevels = ["error", "warn", "info", "debug", "time"];
      for await (const logLevel of defaultLogLevels) {
        await this._db.manager.insert(LogLevel, {
          level: logLevel
        });
      }
    }
    this._logLevels = await this._db.manager.find(LogLevel, { order: { id: "ASC" } });
  }

  public async createDatabase(options: Partial<AppOptions>): Promise<void> {
    this._db = await TypeOrmDataSource.initialize();
    await Promise.all([
      this.ensureLogLevels(),
      this.recordAppInstance(options)
    ]);
  }

  protected async recordAppInstance(options: Partial<AppOptions>) {
    const now = Date.now();
    this._currentApp.name = options.appTitle ? `${options.appTitle}@${now.toString(16)}-${now.toString(12)}` : `app-${now.toString(16)}-${now.toString(12)}`;
    this._currentApp.logs = [];
    await this._db.manager.insert(App, this._currentApp);
  }

  public async findTagIdOrCreate(tag: string): Promise<number> {
    tag = (tag ?? "").trim().toLowerCase();
    if(!tag) return 0;

    return (await this._findTagIdOrCreate(tag))?.id!;
  }

  public async _findTagIdOrCreate(tag: string): Promise<Tag | null> {
    tag = (tag ?? "").trim().toLowerCase();
    if(!tag) return null;

    const manager = this._db.manager;
    const tagExists = await manager.existsBy(Tag, {tag});
    if(tagExists) {
      return await manager.findOneBy(Tag, {tag});
    } else {
      const tagInsertResult = await manager.insert(Tag, { tag });
      return await manager.findOneBy(Tag, {id: tagInsertResult.identifiers[0].id});
    }
  }
}