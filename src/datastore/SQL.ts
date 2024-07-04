type SqlString = string;

const logLevelTable: SqlString = `create table log_level
(
  id    integer constraint log_level_pk primary key,
  level text not null
);`;

const logTable: SqlString = `create table app_log
(
    id           integer not null
        constraint app_log_pk
            primary key autoincrement,
    level_id     INTEGER not null,
    log_tag      text    null,
    log_message  text    not null,
    json_obj     text    null,
    created_on   integer default CURRENT_TIMESTAMP,
    s_created_on text    default CURRENT_TIMESTAMP
);`;

const logLevelData: SqlString = `
  INSERT INTO log_level (id, level) VALUES (1, 'Error');
  INSERT INTO log_level (id, level) VALUES (2, 'Warn');
  INSERT INTO log_level (id, level) VALUES (3, 'Info');
  INSERT INTO log_level (id, level) VALUES (4, 'Debug');
`;

const SQL ={
  logTable, logLevel: logLevelTable, logLevelData
};
export default SQL;