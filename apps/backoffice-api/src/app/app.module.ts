import { AdminModule } from '@modules/admin/admin.module';
import { AuthModule } from '@modules/auth/auth.module';
import { DatabaseModule } from '@modules/database/database.module';
import { OrganizationModule } from '@modules/organization/organization.module';
import { RequestModule } from '@modules/request/request.module';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/backoffice-api/.env',
    }),
    DatabaseModule,

    AdminModule,
    AuthModule,
    OrganizationModule,
    RequestModule,
  ],
})
export class AppModule {}
