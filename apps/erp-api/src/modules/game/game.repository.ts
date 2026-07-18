import { BasicRepository } from '@modules/database/basic/repository.basic';
import { DataSource } from 'typeorm';

import { GameType } from '@erp/types';

import { Injectable } from '@nestjs/common';

import { GameEntity } from './game.entity';

@Injectable()
export class GameRepository extends BasicRepository<GameEntity> {
  constructor(dataSource: DataSource) {
    super(GameEntity, dataSource);
  }

  async findByIdWithRelations(id: number): Promise<GameEntity | null> {
    return await this.findOne({
      where: { id },
      relations: { organization: true, teams: { members: true } },
      order: { teams: { createdAt: 'ASC' } },
    });
  }

  async findByOrganizationAndType(
    organizationId: number,
    type: GameType
  ): Promise<GameEntity | null> {
    return await this.findOne({ where: { organizationId, type } });
  }
}
