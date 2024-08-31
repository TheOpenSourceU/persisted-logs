import SQL from "../SQL";

describe("SQL.ts Constants", () => {
  it("logLevelTable should contain SQL for creating log_level table", () => {
    expect(SQL.logLevelTable).toContain("create table log_level");
    expect(SQL.logLevelTable).toContain(
      "id    integer constraint log_level_pk primary key",
    );
    expect(SQL.logLevelTable).toContain("level text not null");
  });

  it("logTable should contain SQL for creating app_log table", () => {
    expect(SQL.logTable).toContain("create table app_log");
    expect(SQL.logTable).toContain("id           integer not null");
    expect(SQL.logTable).toContain("level_id     INTEGER not null");
    expect(SQL.logTable).toContain("log_message  text    not null");
    expect(SQL.logTable).toContain(
      "created_on   integer default CURRENT_TIMESTAMP",
    );
  });

  it("logLevelData should contain SQL for inserting log levels", () => {
    expect(SQL.logLevelData).toContain(
      "INSERT INTO log_level (id, level) VALUES",
    );
    expect(SQL.logLevelData).toContain(`(1, 'Error')`);
    expect(SQL.logLevelData).toContain(`(2, 'Warn')`);
    expect(SQL.logLevelData).toContain(`(3, 'Info')`);
    expect(SQL.logLevelData).toContain(`(4, 'Debug')`);
  });
});
