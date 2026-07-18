import { AuthModule } from '@modules/auth/auth.module';
import { CacheModule } from '@modules/cache/cache.module';
import { DatabaseModule } from '@modules/database/database.module';
import { EventModule } from '@modules/event/event.module';
import { GameModule } from '@modules/game/game.module';
import { InviteModule } from '@modules/invite/invite.module';
import { OrganizationModule } from '@modules/organization/organization.module';
import { TeamModule } from '@modules/team/team.module';
import { TournamentModule } from '@modules/tournament/tournament.module';
import { UploadModule } from '@modules/upload/upload.module';
import { UserModule } from '@modules/user/user.module';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/erp-api/.env',
    }),
    ScheduleModule.forRoot(),
    CacheModule,
    DatabaseModule,

    AuthModule,
    EventModule,
    GameModule,
    InviteModule,
    OrganizationModule,
    TeamModule,
    TournamentModule,
    UploadModule,
    UserModule,
  ],
})
export class AppModule {}
