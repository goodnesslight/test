import { TeamModule } from '@modules/team/team.module';
import { UserModule } from '@modules/user/user.module';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InviteController } from './invite.controller';
import { InviteEntity } from './invite.entity';
import { InviteRepository } from './invite.repository';
import { InviteService } from './invite.service';

@Module({
  imports: [TypeOrmModule.forFeature([InviteEntity]), TeamModule, UserModule],
  controllers: [InviteController],
  providers: [InviteService, InviteRepository],
  exports: [InviteService],
})
export class InviteModule {}
