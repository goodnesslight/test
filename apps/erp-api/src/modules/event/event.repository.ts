import { BasicRepository } from '@modules/database/basic/repository.basic';
import {
  Between,
  DataSource,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';

import { Injectable } from '@nestjs/common';

import { EventEntity } from './event.entity';

@Injectable()
export class EventRepository extends BasicRepository<EventEntity> {
  constructor(dataSource: DataSource) {
    super(EventEntity, dataSource);
  }

  async findByIdWithRelations(id: number): Promise<EventEntity | null> {
    return await this.findOne({
      where: { id },
      relations: { team: { game: { organization: true }, members: true } },
    });
  }

  async findByTeam(
    teamId: number,
    from?: Date,
    to?: Date
  ): Promise<EventEntity[]> {
    const where: FindOptionsWhere<EventEntity> = { teamId };

    if (from && to) {
      where.startsAt = Between(from, to);
    } else if (from) {
      where.startsAt = MoreThanOrEqual(from);
    } else if (to) {
      where.startsAt = LessThanOrEqual(to);
    }

    return await this.find({
      where,
      relations: { attendances: { user: true } },
      order: { startsAt: 'ASC' },
    });
  }
}
