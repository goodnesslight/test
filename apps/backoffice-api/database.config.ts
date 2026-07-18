import dotenv from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';

import 'reflect-metadata';

dotenv.config();

export default new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  database: process.env.POSTGRES_DB,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  synchronize: process.env.POSTGRES_SYNCHRONIZE === 'true',
  // The backoffice shares the main platform database but owns only its own
  // tables (admins). A dedicated migrations history table keeps its migrations
  // independent of erp-api's (which uses the default "migrations" table).
  migrationsTableName: 'backoffice_migrations',
  entities: [join(__dirname, 'src', '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, 'migrations', '**', '*.{ts,js}')],
});
