import { MailModule } from '@modules/mail/mail.module';
import { UserModule } from '@modules/user/user.module';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrganizationController } from './organization.controller';
import { OrganizationEntity } from './organization.entity';
import { OrganizationRepository } from './organization.repository';
import { OrganizationService } from './organization.service';
import { OrganizationInviteController } from './organization-invite/organization-invite.controller';
import { OrganizationInviteEntity } from './organization-invite/organization-invite.entity';
import { OrganizationInviteRepository } from './organization-invite/organization-invite.repository';
import { OrganizationInviteService } from './organization-invite/organization-invite.service';
import { OrganizationMemberEntity } from './organization-member/organization-member.entity';
import { OrganizationMemberRepository } from './organization-member/organization-member.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrganizationEntity,
      OrganizationInviteEntity,
      OrganizationMemberEntity,
    ]),
    MailModule,
    UserModule,
  ],
  controllers: [OrganizationController, OrganizationInviteController],
  providers: [
    OrganizationInviteRepository,
    OrganizationInviteService,
    OrganizationMemberRepository,
    OrganizationRepository,
    OrganizationService,
  ],
  exports: [OrganizationInviteService, OrganizationService],
})
export class OrganizationModule {}
