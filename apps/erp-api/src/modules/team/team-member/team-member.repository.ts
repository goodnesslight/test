import { BasicRepository } from '@modules/database/basic/repository.basic';
import { DataSource } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { TeamMemberEntity } from './team-member.entity';

@Injectable()
export class TeamMemberRepository extends BasicRepository<TeamMemberEntity> {
  constructor(dataSource: DataSource) {
    super(TeamMemberEntity, dataSource);
  }

  async findByUser(userId: number): Promise<TeamMemberEntity[]> {
    return await this.find({
      where: { userId },
      relations: {
        team: { game: { organization: true }, members: { user: true } },
      },
      order: { createdAt: 'ASC' },
    });
  }

  async findByTeamAndUser(
    teamId: number,
    userId: number
  ): Promise<TeamMemberEntity | null> {
    return await this.findOne({ where: { teamId, userId } });
  }
}
