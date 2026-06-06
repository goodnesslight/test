import { BasicRepository } from '@modules/database/basic/repository.basic';
import { DataSource } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { OrganizationEntity } from './organization.entity';

@Injectable()
export class OrganizationRepository extends BasicRepository<OrganizationEntity> {
  constructor(dataSource: DataSource) {
    super(OrganizationEntity, dataSource);
  }

  async findByIdWithGames(id: number): Promise<OrganizationEntity | null> {
    return await this.findOne({
      where: { id },
      relations: { games: { teams: { members: true } } },
      order: { games: { createdAt: 'ASC', teams: { createdAt: 'ASC' } } },
    });
  }

  async findAllByUser(userId: number): Promise<OrganizationEntity[]> {
    const rows: { id: number }[] = await this.createQueryBuilder('org')
      .select('DISTINCT org.id', 'id')
      .leftJoin('org.games', 'game')
      .leftJoin('game.teams', 'team')
      .leftJoin('team.members', 'member')
      .where('org.ownerId = :userId OR member.userId = :userId', { userId })
      .getRawMany<{ id: number }>();

    if (rows.length === 0) {
      return [];
    }

    return await this.find({
      where: rows.map(({ id }: { id: number }): { id: number } => ({ id })),
      relations: { games: { teams: { members: true } } },
      order: { createdAt: 'DESC' },
    });
  }
}
