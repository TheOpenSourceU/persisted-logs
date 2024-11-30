import "reflect-metadata"
import { DataSource } from "typeorm"
import { LogLevel } from "./entity/LogLevel";
import { Log } from "./entity/Log";
import { Tag } from "./entity/Tag";
import { App } from "./entity/App";

console.log('TypeOrmDataSource: Loading...');
export const TypeOrmDataSource = new DataSource({
    type: "mysql",
    host: "192.168.1.24",
    port: 32768,
    username: "app_user",
    password: "app_user01",
    database: "betterlog_dev",
    synchronize: true,
    logging: true,
    entities: [LogLevel,Log,Tag,App],
    migrations: [],
    subscribers: [],
});
console.log('TypeOrmDataSource: Loaded');
