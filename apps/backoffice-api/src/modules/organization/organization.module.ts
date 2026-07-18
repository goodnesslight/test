import { MailModule } from '@modules/mail/mail.module';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrganizationController } from './organization.controller';
import { OrganizationEntity } from './organization.entity';
import { OrganizationRepository } from './organization.repository';
import { OrganizationService } from './organization.service';
import { OrganizationInviteEntity } from './organization-invite/organization-invite.entity';
import { OrganizationInviteRepository } from './organization-invite/organization-invite.repository';

@Module({
  imports: [
    MailModule,
    TypeOrmModule.forFeature([OrganizationEntity, OrganizationInviteEntity]),
  ],
  controllers: [OrganizationController],
  providers: [
    OrganizationService,
    OrganizationRepository,
    OrganizationInviteRepository,
  ],
  exports: [OrganizationService],
})
export class OrganizationModule {}
