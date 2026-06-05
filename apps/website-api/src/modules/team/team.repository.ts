import { BasicRepository } from '@modules/database/basic/repository.basic';
import { DataSource } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { TeamEntity } from './team.entity';

@Injectable()
export class TeamRepository extends BasicRepository<TeamEntity> {
  constructor(dataSource: DataSource) {
    super(TeamEntity, dataSource);
  }

  async findByIdWithRelations(id: number): Promise<TeamEntity | null> {
    return await this.findOne({
      where: { id },
      relations: { organization: true, members: { user: true } },
      order: { members: { createdAt: 'ASC' } },
    });
  }
}
