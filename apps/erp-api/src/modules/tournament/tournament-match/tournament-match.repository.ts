import { BasicRepository } from '@modules/database/basic/repository.basic';
import { Brackets, DataSource } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { TournamentMatchEntity } from './tournament-match.entity';

@Injectable()
export class TournamentMatchRepository extends BasicRepository<TournamentMatchEntity> {
  constructor(dataSource: DataSource) {
    super(TournamentMatchEntity, dataSource);
  }

  async findById(id: number): Promise<TournamentMatchEntity | null> {
    return await this.findOne({ where: { id } });
  }

  async findByTournament(tournamentId: number): Promise<TournamentMatchEntity[]> {
    return await this.find({ where: { tournamentId } });
  }

  async findScheduledForMember(
    userId: number,
    from?: string,
    to?: string
  ): Promise<TournamentMatchEntity[]> {
    const query = this.createQueryBuilder('match')
      .innerJoinAndSelect('match.tournament', 'tournament')
      .innerJoin('tournament.organization', 'organization')
      .leftJoinAndSelect('match.participantOne', 'participantOne')
      .leftJoinAndSelect('match.participantTwo', 'participantTwo')
      .where('match.startsAt IS NOT NULL')
      .andWhere(
        new Brackets((qb) => {
          qb.where('organization.ownerId = :userId', { userId }).orWhere(
            `EXISTS (SELECT 1 FROM "organization_members" om
               WHERE om."organizationId" = organization.id AND om."userId" = :userId)`,
            { userId }
          );
        })
      );

    if (from) {
      query.andWhere('match.startsAt >= :from', { from });
    }

    if (to) {
      query.andWhere('match.startsAt <= :to', { to });
    }

    return await query.orderBy('match.startsAt', 'ASC').getMany();
  }
}
