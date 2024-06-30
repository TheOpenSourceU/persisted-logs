// import {IDriver} from "quick.db";
// import * as sqlite3 from 'sqlite3';
// import {RunResult, Statement} from "sqlite3";
//
//
// /**
//  * export class SqliteDriver implements IDriver {
//  *     private static instance: SqliteDriver | null = null;
//  *     private readonly _database: Database;
//  *
//  *     get database(): Database {
//  *         return this._database;
//  *     }
//  *
//  *     constructor(path: string) {
//  *         this._database = sqlite3(path);
//  *     }
//  *
//  *     public static createSingleton(path: string): SqliteDriver {
//  *         if (!SqliteDriver.instance) {
//  *             SqliteDriver.instance = new SqliteDriver(path);
//  *         }
//  *         return SqliteDriver.instance;
//  *     }
//  *
//  *     public async prepare(table: string): Promise<void> {
//  *         this._database.exec(
//  *             `CREATE TABLE IF NOT EXISTS ${table} (ID TEXT PRIMARY KEY, json TEXT)`
//  *         );
//  *     }
//  *
//  *     public async getAllRows(
//  *         table: string
//  *     ): Promise<{ id: string; value: any }[]> {
//  *         const prep = this._database.prepare<{ ID: string; json: string }[]>(
//  *             `SELECT * FROM ${table}`
//  *         );
//  *         return (prep.all() as { ID: string, json: string }[])
//  *             .map(row  => ({
//  *                 id: row.ID,
//  *                 value: JSON.parse(row.json),
//  *             })
//  *         );
//  *     }
//  *
//  *     public async getRowByKey<T>(
//  *         table: string,
//  *         key: string
//  *     ): Promise<[T | null, boolean]> {
//  *         const value = (await this._database
//  *             .prepare(`SELECT json FROM ${table} WHERE ID = @key`)
//  *             .get({ key })) as { ID: string; json: string };
//  *
//  *         return value != null ? [JSON.parse(value.json), true] : [null, false];
//  *     }
//  *
//  *     public async getStartsWith(
//  *         table: string,
//  *         query: string
//  *     ): Promise<{ id: string; value: any }[]> {
//  *         const prep = this._database.prepare<{ ID: string; json: string }[]>(
//  *             `SELECT * FROM ${table} WHERE ID LIKE '${query}%'`
//  *         );
//  *
//  *         return (prep.all() as { ID: string, json: string }[])
//  *             .map(row  => ({
//  *                 id: row.ID,
//  *                 value: JSON.parse(row.json),
//  *             })
//  *         );
//  *     }
//  *
//  *     public async setRowByKey<T>(
//  *         table: string,
//  *         key: string,
//  *         value: any,
//  *         update: boolean
//  *     ): Promise<T> {
//  *         const stringifiedJson = JSON.stringify(value);
//  *         if (update) {
//  *             this._database
//  *                 .prepare(`UPDATE ${table} SET json = (?) WHERE ID = (?)`)
//  *                 .run(stringifiedJson, key);
//  *         } else {
//  *             this._database
//  *                 .prepare(`INSERT INTO ${table} (ID,json) VALUES (?,?)`)
//  *                 .run(key, stringifiedJson);
//  *         }
//  *
//  *         return value;
//  *     }
//  *
//  *     public async deleteAllRows(table: string): Promise<number> {
//  *         const result = this._database.prepare(`DELETE FROM ${table}`).run();
//  *         return result.changes;
//  *     }
//  *
//  *     public async deleteRowByKey(table: string, key: string): Promise<number> {
//  *         const result = this._database
//  *             .prepare(`DELETE FROM ${table} WHERE ID=@key`)
//  *             .run({ key });
//  *         return result.changes;
//  *     }
//  * }
//  */
//
// type LogEntryType = {
//   id:number,
//   log_level: string;
//   log_key: string;
//   json: string;
//   created_at: string;
// }
//
// export default class Sqlite3Driver implements IDriver {
//   //private static instance: SqliteDriver | null = null;
//   private readonly _database: sqlite3.Database;
//   private readonly path: string;
//
//   constructor(path:string, verbose:boolean) {
//     this.path = path || ':memory:';
//     verbose = verbose || false;
//
//     const sl = verbose ? sqlite3.verbose() : sqlite3;
//     this._database = new sl.Database(this.path);
//   }
//
//   private async run(sql: string): Promise<RunResult> {
//     return await new Promise((resolve, reject) => {
//       this._database.run(sql, function (err) {
//         if(err) reject(err);
//         resolve(this);
//       });
//     });
//   }
//
//   private async get<T>(sql: string): Promise<T[]> {
//     return await new Promise((resolve, reject) => {
//       this._database.all(sql, (er, rows: T[]) => {
//         if(er) reject(er);
//         resolve(rows);
//       });
//     });
//   }
//
//
//   public async deleteAllRows(table: string): Promise<number> {
//     const r = await this.run(`DELETE FROM ${table}`);
//     return r.changes;
//   }
//
//   public async deleteRowByKey(table: string, key: string): Promise<number> {
//     const r = await this.run("DELETE FROM ${table} where `key` = '${key}'");
//     return r.changes;
//   }
//
//   public async getAllRows(table: string): Promise<{ id: string; value: any }[]> {
//     const result = await this.get<LogEntryType>(`SELECT * FROM ${table} order by created_at asc;`);
//     return result.map(r => ({id: `${r.id}-${r.log_level}-${r.log_key}`, value: JSON.parse(r.json)}))
//   }
//
//   /**
//    * How do we fit the "key" concept in to our log utility.
//    * Maybe we should just skip the quick.db thing and just use sqlite3 directly.
//    * @param table
//    * @param key
//    */
//   public async getRowByKey<T>(table: string, key: string): Promise<[T | null, boolean]> {
//     const result = await this.get<LogEntryType>(`SELECT * FROM ${table} where log_key='${key}' order by created_at asc;`);
//     const rows = result.map(r => ({id: `${r.id}-${r.log_level}-${r.log_key}`, value: JSON.parse(r.json)}))
//     return rows.length > 0 ? [rows, true] : [null, false];
//   }
//
//   public async setRowByKey<T>(table: string, key: string, value: any, update: boolean): Promise<T> {
//     const sql = `INSERT INTO ${table} (log_level, log_key, json, created_at) VALUES ('info', '${key}', '${JSON.stringify(value)}', datetime('now'))`;
//     await this.run(sql);
//     return null as T;
//   }
//
//
//   public async prepare(table: string): Promise<void> {
//     // this._database.exec(
//     //   `CREATE TABLE IF NOT EXISTS ${table} (ID TEXT PRIMARY KEY, json TEXT)`
//     // );
//     const sql = `
//         CREATE TABLE IF NOT EXISTS '${table}' (
//            id INTEGER PRIMARY KEY AUTOINCREMENT,
//            log_level TEXT,
//             log_key text,
//            json TEXT,
//            created_at DATE
//         );
//     `;
//     await this.run(sql);
//   }
//
//
// }
