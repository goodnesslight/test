import { CacheModule } from '@modules/cache/cache.module';
import { DatabaseModule } from '@modules/database/database.module';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/api/.env',
    }),
    ScheduleModule.forRoot(),
    CacheModule,
    DatabaseModule,
  ],
})
export class AppModule {}
