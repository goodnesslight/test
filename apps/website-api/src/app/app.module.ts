import { AccountModule } from '@modules/account/account.module';
import { AuthModule } from '@modules/auth/auth.module';
import { AvatarModule } from '@modules/avatar/avatar.module';
import { CacheModule } from '@modules/cache/cache.module';
import { DatabaseModule } from '@modules/database/database.module';
import { InventoryModule } from '@modules/inventory/inventory.module';
import { ItemModule } from '@modules/item/item.module';
import { MatchModule } from '@modules/match/match.module';
import { ServerModule } from '@modules/server/server.module';

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

    AccountModule,
    AuthModule,
    AvatarModule,
    InventoryModule,
    ItemModule,
    MatchModule,
    ServerModule,
  ],
})
export class AppModule {}
