import { BasicRepository } from '@modules/database/basic/repository.basic';
import { DataSource } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { TeamMemberEntity } from './team-member.entity';

@Injectable()
export class TeamMemberRepository extends BasicRepository<TeamMemberEntity> {
  constructor(dataSource: DataSource) {
    super(TeamMemberEntity, dataSource);
  }

  async findByTeamAndUser(
    teamId: number,
    userId: number
  ): Promise<TeamMemberEntity | null> {
    return await this.findOne({ where: { teamId, userId } });
  }
}
