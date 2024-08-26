import * as sqlite3 from "sqlite3";
import { DataStoreType, LogLevelType, LogRecordType } from "./types";
import SQL from "./SQL";

// Under_Dev:
//  this isn't quite working yet. The observed problem is that there
//  is only one message that shows up. everything else seems lost.
//  I'm thinking the problem is my usage of the sqlite3 lib. I'm doing
//  something wrong or it's not working as I expect.

/**
 * Logger that logs to a sqlite3 database.
 */
export default class Sqlite3Logger2 {
  private readonly _dbPath: DataStoreType;
  public constructor(path:DataStoreType = ":memory:") {
    this._dbPath = path;
  }

  private static readonly errorLogMap: { [key in LogLevelType]: number } = {
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
  };

  public async RecordLog({level, tags, message}: LogRecordType): Promise<void> {
    const _tagsForNow = Array.isArray(tags) ? tags.map(i => i.stripColors.trim()).join(",") : tags.stripColors.trim();

    const params = {
      $level: Sqlite3Logger2.errorLogMap[level],
      $logTag: _tagsForNow,
      $logMessage: message.stripColors,
      $logJson: JSON.stringify({ tag:_tagsForNow, message: message }),
    };

    const sql: string = `
        insert into app_log (level_id, log_tag, log_message, json_obj, created_on, s_created_on)
        values ($level, $logTag, $logMessage, $logJson, current_timestamp, current_timestamp);
    `;


    const db = new sqlite3.Database(this._dbPath);
    const reportError = (er: Error | null) => {
      if(!er) return;
      console.error("Error inserting log message");
      console.error(er);
    }
    try {
      db.serialize(() => {
        console.log('Sqlite3Logger2.RecordLog: db.serialize db.serialize callback');

        // Database has tables? If not, create them.
        db.run(SQL.stmtLogTableExists, (err, row) => {
          reportError(err);
          if (!row) {
            db.serialize(() => {
              console.log('Sqlite3Logger2.RecordLog: db.serialize db.serialize callback');
              db.run(SQL.logTable, () => {
                console.debug("log table created");
              });
              db.run(SQL.logLevelTable, () => {
                console.debug("log level table created");
              });
              db.run(SQL.logTags, () => {
                console.debug("log tags created");
              });
              db.run(SQL.logTagsTable, () => {
                console.debug("log tags table created");
              });

              db.run(SQL.logLevelData, () => {
                console.debug("log level created");
              });
            });
          }
        });

        // TODO: The SQL To break down and insert the tags into the tags table
        //  as well as the log_tags table.
        db.run(sql, params, (er) => {
          console.log('Sqlite3Logger2.RecordLog: db.run callback');
          reportError(er);

          // This is the last step so we can close here.
          db.close((er) => {
            reportError(er);
            console.log("db closed");
          });
        });
      });
    } catch(er) {
      console.error("Error processing db statements");
      console.error(er);
    } finally {
      //db.close();
    }
  }

}