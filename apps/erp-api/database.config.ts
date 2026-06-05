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
  entities: [join(__dirname, 'src', '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, 'migrations', '**', '*.{ts,js}')],
});
