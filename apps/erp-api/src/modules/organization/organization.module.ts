import { UserModule } from '@modules/user/user.module';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrganizationController } from './organization.controller';
import { OrganizationEntity } from './organization.entity';
import { OrganizationRepository } from './organization.repository';
import { OrganizationService } from './organization.service';
import { OrganizationMemberEntity } from './organization-member/organization-member.entity';
import { OrganizationMemberRepository } from './organization-member/organization-member.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrganizationEntity, OrganizationMemberEntity]),
    UserModule,
  ],
  controllers: [OrganizationController],
  providers: [
    OrganizationMemberRepository,
    OrganizationRepository,
    OrganizationService,
  ],
  exports: [OrganizationService],
})
export class OrganizationModule {}
