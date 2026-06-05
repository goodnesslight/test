import { OrganizationModule } from '@modules/organization/organization.module';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TeamController } from './team.controller';
import { TeamEntity } from './team.entity';
import { TeamRepository } from './team.repository';
import { TeamService } from './team.service';
import { TeamMemberEntity } from './team-member/team-member.entity';
import { TeamMemberRepository } from './team-member/team-member.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([TeamEntity, TeamMemberEntity]),
    OrganizationModule,
  ],
  controllers: [TeamController],
  providers: [TeamService, TeamRepository, TeamMemberRepository],
  exports: [TeamService],
})
export class TeamModule {}
