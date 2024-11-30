import { IBetterLogLogger } from "./IBetterLogLogger";
import { RunResult } from "sqlite3";
import { LogRecordType } from "./types";
import { TypeOrmDataSource } from "./TypeOrmDataSource"
import { DataSource } from "typeorm";
import { Log } from "./entity/Log";
import { Tag } from "./entity/Tag";
import { LogLevel } from "./entity/LogLevel";
import { log } from "node:util";

// .then(async () => {
//
//   console.log("Inserting a new user into the database...")
//   const user = new User()
//   user.firstName = "Timber"
//   user.lastName = "Saw"
//   user.age = 25
//   await AppDataSource.manager.save(user)
//   console.log("Saved a new user with id: " + user.id)
//
//   console.log("Loading users from the database...")
//   const users = await AppDataSource.manager.find(User)
//   console.log("Loaded users: ", users)
//
//   console.log("Here you can setup and run express / fastify / any other framework.")
//
// }).catch(error => console.log(error))





export default class MySqlLogger implements IBetterLogLogger {
  // @ts-ignore Intended
  private _db: DataSource;

  // @ts-ignore Intended
  private _logLevels: LogLevel[];

  public async Close(): Promise<void> {
    await this._db.destroy();
    return;
  }

  public async PruneLogs(prune: number): Promise<false | any[] | RunResult> {
    return Promise.resolve(false);
  }

  public async RecordLog({ level, tags, message }: LogRecordType): Promise<void> {
    // const log = new Log();
    // log.message = message;
    // log.tags = [];
    // log.logLevel = this._logLevels.find(itm => itm.level === level) as LogLevel;
    // log.createdOn = new Date();
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

  public async createDatabase(): Promise<void> {
    this._db = await TypeOrmDataSource.initialize();
    // Ensure the logLevels exist

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