import { config } from 'dotenv';
config();
type SupportedDatabasePlatformType = 'mysql' | 'mariadb' | 'postgres' | 'sqlite';

const Env = {
  NodeEnv: process.env?.NODE_ENV ?? 'development',
  IsDev: process.env?.NODE_ENV === 'development',

  // TypeOrm
  TypeOrmType: 'mysql' as SupportedDatabasePlatformType,
  TypeOrmHost: '0.0.0.0',
  TypeOrmPort: 3306,
  TypeOrmUserName: 'root',
  TypeOrmPwd: 'root',
  TypeOrmDatabase: 'logs',
};

function ReloadEnvironmentVariables() {
  config();
  const {
    NODE_ENV,

    TYPEORM_TYPE,
    TYPEORM_HOST,
    TYPEORM_PORT,
    TYPEORM_USERNAME,
    TYPEORM_PASSWORD,
    TYPEORM_DATABASE,
  } = process.env;
  Env.NodeEnv = NODE_ENV ?? 'development';
  Env.IsDev = NODE_ENV === 'development';

  Env.TypeOrmType = (TYPEORM_TYPE ?? Env.TypeOrmType) as SupportedDatabasePlatformType;
  Env.TypeOrmHost = TYPEORM_HOST ?? Env.TypeOrmHost ?? 'localhost';

  if (!isNaN(parseInt(TYPEORM_PORT as string))) {
    Env.TypeOrmPort = parseInt(TYPEORM_PORT as string) ?? Env.TypeOrmPort;
  } else {
    Env.TypeOrmPort = Env.TypeOrmPort ?? 3306;
  }

  Env.TypeOrmUserName = TYPEORM_USERNAME ?? Env.TypeOrmUserName ?? 'root';
  Env.TypeOrmPwd = TYPEORM_PASSWORD ?? Env.TypeOrmPwd ?? 'root';
  Env.TypeOrmDatabase = TYPEORM_DATABASE ?? Env.TypeOrmDatabase ?? 'betterlog_dev';

  console.log('BetterLog', Env);
}
ReloadEnvironmentVariables();

export default Env;
export { ReloadEnvironmentVariables };
