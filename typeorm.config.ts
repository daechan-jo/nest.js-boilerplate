import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

dotenv.config();
export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER_NAME,
  password: String(process.env.DB_PASSWORD),
  database: process.env.DB_NAME,
  entities: [],
  synchronize: true,
  migrations: ['dist/migration/*.js'],
  migrationsTableName: 'migrations',
  extra: {
    max: 4500,
    connectionTimeoutMillis: 5000,
  },
  // ssl: {
  //   rejectUnauthorized: false,
  // },
};
