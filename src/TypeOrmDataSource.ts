import "reflect-metadata"
import { DataSource } from "typeorm"
import { App, Tag, Log, LogLevel } from "./entity";

export const TypeOrmDataSource = new DataSource({
    type: "mysql",
    host: "192.168.1.24",
    port: 32768,
    username: "app_user",
    password: "app_user01",
    database: "betterlog_dev",
    synchronize: true,
    logging: false,
    entities: [LogLevel,Log,Tag,App],
    migrations: [],
    subscribers: [],
});
