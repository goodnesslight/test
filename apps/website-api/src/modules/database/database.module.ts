import { ConfigKey } from '@common/types/config.type';

import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => ({
        type: 'postgres',
        autoLoadEntities: true,
        host: config.getOrThrow(ConfigKey.POSTGRES_HOST),
        port: config.getOrThrow(ConfigKey.POSTGRES_PORT),
        database: config.getOrThrow(ConfigKey.POSTGRES_DB),
        username: config.getOrThrow(ConfigKey.POSTGRES_USER),
        password: config.getOrThrow(ConfigKey.POSTGRES_PASSWORD),
        synchronize: config.getOrThrow(ConfigKey.POSTGRES_SYNCHRONIZE),
      }),
    }),
  ],
})
export class DatabaseModule {}
