import SQL from "../SQL";

describe("SQL.ts Constants", () => {
  it("logLevelTable should contain SQL for creating log_level table", () => {
    expect(SQL.logLevelTable).toContain("create table if not exists log_level");
    expect(SQL.logLevelTable).toContain(
      "id    integer constraint log_level_pk primary key"
    );
    expect(SQL.logLevelTable).toContain("level text not null");
  });

  it("logTable should contain SQL for creating app_log table", () => {
    expect(SQL.logTable).toContain("create table if not exists app_log");
    expect(SQL.logTable).toContain("id           integer not null");
    expect(SQL.logTable).toContain("level_id     INTEGER not null");
    expect(SQL.logTable).toContain("log_message  text    not null");
    expect(SQL.logTable).toContain(
      "created_on   integer default CURRENT_TIMESTAMP"
    );
  });

  it("logLevelData should contain SQL for inserting log levels", () => {
    expect(SQL.logLevelData).toHaveLength(4);
    expect(SQL.logLevelData[0]).toBe("INSERT INTO log_level (id, level)\n  SELECT 1, 'Error'\n  WHERE NOT EXISTS (SELECT 1 FROM log_level WHERE id = 1);");
    expect(SQL.logLevelData[1]).toBe("INSERT INTO log_level (id, level)\n  SELECT 2, 'Warn'\n  WHERE NOT EXISTS (SELECT 1 FROM log_level WHERE id = 2);");
    expect(SQL.logLevelData[2]).toBe("INSERT INTO log_level (id, level)\n  SELECT 3, 'Info'\n  WHERE NOT EXISTS (SELECT 1 FROM log_level WHERE id = 3);");
    expect(SQL.logLevelData[3]).toBe("INSERT INTO log_level (id, level)\n  SELECT 4, 'Debug'\n  WHERE NOT EXISTS (SELECT 1 FROM log_level WHERE id = 4);");
  });
});
