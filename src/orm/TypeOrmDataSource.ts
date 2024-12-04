import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { App, Tag, Log, LogLevel } from './entity';
import Env from '../stuff/Env';

export const TypeOrmDataSource = new DataSource({
  type: Env.TypeOrmType,
  host: Env.TypeOrmHost,
  port: Env.TypeOrmPort as unknown as number,
  username: Env.TypeOrmUserName,
  password: Env.TypeOrmPwd,
  database: Env.TypeOrmDatabase,
  synchronize: true,
  logging: false,
  entities: [LogLevel, Log, Tag, App],
  migrations: [],
  subscribers: [],
});
