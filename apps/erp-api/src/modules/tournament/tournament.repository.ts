import { BasicRepository } from '@modules/database/basic/repository.basic';
import { DataSource } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { TournamentEntity } from './tournament.entity';

@Injectable()
export class TournamentRepository extends BasicRepository<TournamentEntity> {
  constructor(dataSource: DataSource) {
    super(TournamentEntity, dataSource);
  }

  async findById(id: number): Promise<TournamentEntity | null> {
    return await this.findOne({ where: { id } });
  }

  async findByIdWithRelations(id: number): Promise<TournamentEntity | null> {
    return await this.findOne({
      where: { id },
      relations: {
        stages: true,
        participants: true,
        matches: { participantOne: true, participantTwo: true },
      },
      order: {
        stages: { order: 'ASC' },
        participants: { seed: 'ASC', id: 'ASC' },
        matches: { round: 'ASC', slot: 'ASC', id: 'ASC' },
      },
    });
  }

  async findByOrganization(organizationId: number): Promise<TournamentEntity[]> {
    return await this.find({
      where: { organizationId },
      order: { startsAt: 'DESC', id: 'DESC' },
    });
  }
}
