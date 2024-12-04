import { boundMethod } from 'autobind-decorator';
import { DataSource } from 'typeorm';
import type { AppOptions, LogRecordType } from '../types';
import type { IDBLogger } from './IDBLogger';
import { TypeOrmDataSource } from '../orm/TypeOrmDataSource';
import { Log, Tag, LogLevel, App } from '../orm/entity';


export default class MySqlLogger implements IDBLogger {
  private _db: DataSource;
  private _logLevels: LogLevel[];
  private _currentApp?: App;
  private _options: Partial<AppOptions>;

  public constructor() {
    this._db = TypeOrmDataSource;
    this._logLevels = [];
    this._options = {};
  }

  @boundMethod
  public async createDatabase(options: Partial<AppOptions>): Promise<void> {
    if(!TypeOrmDataSource.isInitialized) {
      this._db = await TypeOrmDataSource.initialize();
      this._options = options;
      await Promise.all([this.ensureLogLevels(), this.recordAppInstance(options)]);
    }
  }

  @boundMethod
  public async RecordLog({ level, tags, message }: LogRecordType): Promise<void> {
    await this.createDatabase(this._options);

    await this._db.manager.transaction(async () => {
      const tagsList: Tag[] = [];
      const tagIdSet = new Set<number>();
      for (const tag of tags) {
        const t = await this._findTagIdOrCreate(tag);
        if (t && !tagIdSet.has(t.id)) {
          tagsList.push(t);
          tagIdSet.add(t.id);
        }
      }

      const data = {
        message,
        tags: tagsList,
        logLevel: this._logLevels.find(itm => itm.level === level) as LogLevel,
        createdOn: new Date(),
        app: this._currentApp,
      };
      await this._db.manager.insert(Log, data);
    });
  }

  @boundMethod
  public async createTag(tag: string): Promise<number> {
    return await this.findTagIdOrCreate(tag);
  }

  @boundMethod
  public async convertToTagList(tags: string[]): Promise<Set<number>> {
    const tagIds = new Set<number>();
    for (const tag of tags) {
      const _tag = (tag ?? '').trim().toLowerCase();
      if (_tag) {
        const generatedTagId = await this.createTag(_tag);
        if (tagIds.has(generatedTagId)) {
          console.warn(`duplicate tag id? ${generatedTagId}`);
        }
        tagIds.add(generatedTagId);
      }
    }
    return tagIds;
  }

  @boundMethod
  public async findTagIdOrCreate(tag: string): Promise<number> {
    tag = (tag ?? '').trim().toLowerCase();
    if (!tag) return 0;

    return (await this._findTagIdOrCreate(tag))?.id!;
  }

  @boundMethod
  public async _findTagIdOrCreate(tag: string): Promise<Tag | null> {
    tag = (tag ?? '').trim().toLowerCase();
    if (!tag) return null;

    await this.createDatabase(this._options);
    const manager = this._db.manager;
    const tagExists = await manager.existsBy(Tag, { tag });
    if (tagExists) {
      return await manager.findOneBy(Tag, { tag });
    } else {
      const tagInsertResult = await manager.insert(Tag, { tag });
      return await manager.findOneBy(Tag, { id: tagInsertResult.identifiers[0].id });
    }
  }

  @boundMethod
  public async PruneLogs(prune: number): Promise<false | any[]> {
    return Promise.resolve(false);
  }

  @boundMethod
  public async Close(): Promise<void> {
    await this.createDatabase(this._options);
    await this._db.destroy();
  }

  @boundMethod
  private async ensureLogLevels() {
    const logLevels = await this._db.manager.find(LogLevel);
    if (logLevels.length === 0) {
      // LogLevelType
      const defaultLogLevels = ['error', 'warn', 'info', 'debug', 'time'];
      for await (const logLevel of defaultLogLevels) {
        await this._db.manager.insert(LogLevel, {
          level: logLevel,
        });
      }
    }
    this._logLevels = await this._db.manager.find(LogLevel, { order: { id: 'ASC' } });
  }

  @boundMethod
  protected async recordAppInstance(options: Partial<AppOptions>) {
    const now = Date.now();
    this._currentApp = new App();
    this._currentApp.name = options.appTitle
      ? `${options.appTitle}@${now.toString(16)}-${now.toString(12)}`
      : `app-${now.toString(16)}-${now.toString(12)}`;
    this._currentApp.logs = [];
    await this._db.manager.insert(App, this._currentApp);
  }
}
