import { BasicRepository } from '@modules/database/basic/repository.basic';
import {
  Between,
  Brackets,
  DataSource,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  SelectQueryBuilder,
  WhereExpressionBuilder,
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

  async findByUser(
    userId: number,
    from?: Date,
    to?: Date
  ): Promise<EventEntity[]> {
    const query: SelectQueryBuilder<EventEntity> = this.createQueryBuilder(
      'event'
    )
      .innerJoinAndSelect('event.team', 'team')
      .innerJoinAndSelect('team.game', 'game')
      .innerJoinAndSelect('game.organization', 'organization')
      .leftJoinAndSelect('event.attendances', 'attendance')
      .leftJoinAndSelect('attendance.user', 'attendanceUser')
      .where(
        new Brackets((qb: WhereExpressionBuilder): void => {
          qb.where('organization.ownerId = :userId').orWhere(
            `EXISTS (
              SELECT 1 FROM "team_members" "member"
              WHERE "member"."teamId" = team.id AND "member"."userId" = :userId
            )`
          );
        })
      )
      .setParameter('userId', userId)
      .orderBy('event.startsAt', 'ASC');

    if (from) {
      query.andWhere('event.startsAt >= :from', { from });
    }

    if (to) {
      query.andWhere('event.startsAt <= :to', { to });
    }

    return await query.getMany();
  }
}
