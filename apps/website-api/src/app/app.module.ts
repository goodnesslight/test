import { AuthModule } from '@modules/auth/auth.module';
import { CacheModule } from '@modules/cache/cache.module';
import { DatabaseModule } from '@modules/database/database.module';
import { EventModule } from '@modules/event/event.module';
import { InviteModule } from '@modules/invite/invite.module';
import { OrganizationModule } from '@modules/organization/organization.module';
import { TeamModule } from '@modules/team/team.module';
import { UserModule } from '@modules/user/user.module';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/website-api/.env',
    }),
    ScheduleModule.forRoot(),
    CacheModule,
    DatabaseModule,
    UserModule,
    AuthModule,
    OrganizationModule,
    TeamModule,
    InviteModule,
    EventModule,
  ],
})
export class AppModule {}
