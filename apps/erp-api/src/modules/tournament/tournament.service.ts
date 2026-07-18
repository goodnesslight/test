import { OrganizationService } from '@modules/organization/organization.service';
import { UserEntity } from '@modules/user/user.entity';
import { DataSource, EntityManager } from 'typeorm';

import {
  TournamentCreateDto,
  TournamentMatchesGetDto,
  TournamentMatchResultDto,
} from '@erp/dtos';
import { TournamentFormat, TournamentStageType, TournamentStatus } from '@erp/types';

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { TournamentEntity } from './tournament.entity';
import { TournamentRepository } from './tournament.repository';
import { TournamentMatchEntity } from './tournament-match/tournament-match.entity';
import { TournamentMatchRepository } from './tournament-match/tournament-match.repository';
import { TournamentParticipantEntity } from './tournament-participant/tournament-participant.entity';
import { TournamentStageEntity } from './tournament-stage/tournament-stage.entity';

interface GroupStanding {
  participantId: number;
  played: number;
  wins: number;
  scoreFor: number;
  scoreAgainst: number;
}

@Injectable()
export class TournamentService {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly tournamentRepository: TournamentRepository,
    private readonly tournamentMatchRepository: TournamentMatchRepository,
    private readonly dataSource: DataSource
  ) {}

  async create(
    organizationId: number,
    user: UserEntity,
    dto: TournamentCreateDto
  ): Promise<TournamentEntity> {
    await this.organizationService.assertCanManage(organizationId, user);

    const groupCount: number = this.resolveGroupCount(dto);
    const advanceCount: number = dto.advanceCount ?? 1;

    if (
      dto.format === TournamentFormat.GROUPS_PLAYOFF &&
      groupCount * advanceCount < 2
    ) {
      throw new BadRequestException(
        'Groups + playoff needs at least two qualifying participants'
      );
    }

    const id: number = await this.dataSource.transaction(
      async (manager: EntityManager): Promise<number> => {
        const tournament: TournamentEntity = await manager.save(
          manager.create(TournamentEntity, {
            organizationId,
            name: dto.name,
            format: dto.format,
            status: TournamentStatus.DRAFT,
            startsAt: new Date(dto.startsAt),
            endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
            description: dto.description ?? null,
          })
        );

        const participants: TournamentParticipantEntity[] =
          await this.createParticipants(manager, tournament.id, dto, groupCount);

        if (dto.format === TournamentFormat.SINGLE_ELIMINATION) {
          const stage: TournamentStageEntity = await this.createStage(
            manager,
            tournament.id,
            TournamentStageType.BRACKET,
            0,
            'Playoff'
          );
          await this.buildBracket(
            manager,
            tournament.id,
            stage.id,
            this.seedPositions(participants)
          );
        } else {
          const groupStage: TournamentStageEntity = await this.createStage(
            manager,
            tournament.id,
            TournamentStageType.GROUP,
            0,
            'Group stage',
            groupCount,
            dto.format === TournamentFormat.GROUPS_PLAYOFF ? advanceCount : null
          );
          await this.buildGroupMatches(
            manager,
            tournament.id,
            groupStage.id,
            participants,
            groupCount
          );

          if (dto.format === TournamentFormat.GROUPS_PLAYOFF) {
            const playoffStage: TournamentStageEntity = await this.createStage(
              manager,
              tournament.id,
              TournamentStageType.BRACKET,
              1,
              'Playoff'
            );
            const size: number = this.nextPowerOfTwo(groupCount * advanceCount);
            await this.buildBracket(
              manager,
              tournament.id,
              playoffStage.id,
              new Array<number | null>(size).fill(null)
            );
          }
        }

        return tournament.id;
      }
    );

    return await this.getByIdWithRelations(id);
  }

  async setMatchResult(
    id: number,
    matchId: number,
    user: UserEntity,
    dto: TournamentMatchResultDto
  ): Promise<TournamentEntity> {
    const tournament: TournamentEntity = await this.getById(id);

    await this.organizationService.assertCanManage(
      tournament.organizationId,
      user
    );

    const match: TournamentMatchEntity | null =
      await this.tournamentMatchRepository.findById(matchId);

    if (!match || match.tournamentId !== id) {
      throw new NotFoundException('Match not found');
    }

    if (
      dto.winnerId !== undefined &&
      dto.winnerId !== null &&
      dto.winnerId !== match.participantOneId &&
      dto.winnerId !== match.participantTwoId
    ) {
      throw new BadRequestException('Winner must be one of the match participants');
    }

    await this.dataSource.transaction(
      async (manager: EntityManager): Promise<void> => {
        match.winnerId = dto.winnerId ?? null;
        match.scoreOne = dto.scoreOne ?? null;
        match.scoreTwo = dto.scoreTwo ?? null;

        if (dto.startsAt !== undefined) {
          match.startsAt = dto.startsAt ? new Date(dto.startsAt) : null;
        }

        await manager.save(match);

        if (match.nextMatchId) {
          await this.applyToNextMatch(manager, match);
        }
      }
    );

    await this.refreshStatus(id);

    return await this.getByIdWithRelations(id);
  }

  async seedPlayoff(id: number, user: UserEntity): Promise<TournamentEntity> {
    const tournament: TournamentEntity = await this.getByIdWithRelations(id);

    await this.organizationService.assertCanManage(
      tournament.organizationId,
      user
    );

    if (tournament.format !== TournamentFormat.GROUPS_PLAYOFF) {
      throw new BadRequestException('This tournament has no playoff to seed');
    }

    const groupStage: TournamentStageEntity | undefined = tournament.stages.find(
      (stage: TournamentStageEntity): boolean =>
        stage.type === TournamentStageType.GROUP
    );
    const bracketStage: TournamentStageEntity | undefined =
      tournament.stages.find(
        (stage: TournamentStageEntity): boolean =>
          stage.type === TournamentStageType.BRACKET
      );

    if (!groupStage || !bracketStage) {
      throw new BadRequestException('Tournament stages are misconfigured');
    }

    const advanceCount: number = groupStage.advanceCount ?? 1;
    const groupCount: number = groupStage.groupCount ?? 1;

    const qualifiers: (number | null)[] = this.collectQualifiers(
      tournament,
      groupCount,
      advanceCount
    );
    const size: number = this.nextPowerOfTwo(qualifiers.length);
    const positions: (number | null)[] = new Array<number | null>(size).fill(
      null
    );
    const seeds: number[] = this.seedOrder(size);

    for (let position = 0; position < size; position++) {
      const seedIndex: number = seeds[position] - 1;
      positions[position] = qualifiers[seedIndex] ?? null;
    }

    await this.dataSource.transaction(
      async (manager: EntityManager): Promise<void> => {
        const round1: TournamentMatchEntity[] = tournament.matches
          .filter(
            (match: TournamentMatchEntity): boolean =>
              match.stageId === bracketStage.id && match.round === 1
          )
          .sort(
            (a: TournamentMatchEntity, b: TournamentMatchEntity): number =>
              (a.slot ?? 0) - (b.slot ?? 0)
          );

        for (let index = 0; index < round1.length; index++) {
          const match: TournamentMatchEntity = round1[index];
          match.participantOneId = positions[index * 2] ?? null;
          match.participantTwoId = positions[index * 2 + 1] ?? null;
          match.winnerId = null;
          match.scoreOne = null;
          match.scoreTwo = null;
          await manager.save(match);
          await this.autoAdvanceBye(manager, match);
        }
      }
    );

    await this.refreshStatus(id);

    return await this.getByIdWithRelations(id);
  }

  async getForOrganization(
    organizationId: number,
    user: UserEntity
  ): Promise<TournamentEntity[]> {
    await this.assertCanView(organizationId, user);

    return await this.tournamentRepository.findByOrganization(organizationId);
  }

  async getByIdForUser(id: number, user: UserEntity): Promise<TournamentEntity> {
    const tournament: TournamentEntity = await this.getByIdWithRelations(id);

    await this.assertCanView(tournament.organizationId, user);

    return tournament;
  }

  async getMatchesForMember(
    user: UserEntity,
    dto: TournamentMatchesGetDto
  ): Promise<TournamentMatchEntity[]> {
    return await this.tournamentMatchRepository.findScheduledForMember(
      user.id,
      dto.from,
      dto.to
    );
  }

  async delete(id: number, user: UserEntity): Promise<null> {
    const tournament: TournamentEntity = await this.getById(id);

    await this.organizationService.assertCanManage(
      tournament.organizationId,
      user
    );
    await this.tournamentRepository.delete(id);

    return null;
  }

  private async getById(id: number): Promise<TournamentEntity> {
    const tournament: TournamentEntity | null =
      await this.tournamentRepository.findById(id);

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    return tournament;
  }

  private async getByIdWithRelations(id: number): Promise<TournamentEntity> {
    const tournament: TournamentEntity | null =
      await this.tournamentRepository.findByIdWithRelations(id);

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    return tournament;
  }

  private async assertCanView(
    organizationId: number,
    user: UserEntity
  ): Promise<void> {
    const isMember: boolean = await this.organizationService.isMember(
      organizationId,
      user.id
    );

    if (!isMember) {
      throw new ForbiddenException('You are not a member of this organization');
    }
  }

  private resolveGroupCount(dto: TournamentCreateDto): number {
    if (dto.format === TournamentFormat.SINGLE_ELIMINATION) {
      return 0;
    }

    if (dto.format === TournamentFormat.ROUND_ROBIN) {
      return 1;
    }

    return dto.groupCount && dto.groupCount > 0 ? dto.groupCount : 2;
  }

  private async createParticipants(
    manager: EntityManager,
    tournamentId: number,
    dto: TournamentCreateDto,
    groupCount: number
  ): Promise<TournamentParticipantEntity[]> {
    const participants: TournamentParticipantEntity[] = [];

    for (let index = 0; index < dto.participants.length; index++) {
      const source = dto.participants[index];
      const groupIndex: number | null =
        groupCount > 0
          ? source.groupIndex ?? index % groupCount
          : null;

      participants.push(
        await manager.save(
          manager.create(TournamentParticipantEntity, {
            tournamentId,
            name: source.name,
            seed: source.seed ?? index + 1,
            groupIndex,
            teamId: source.teamId ?? null,
            logoUrl: null,
          })
        )
      );
    }

    return participants;
  }

  private async createStage(
    manager: EntityManager,
    tournamentId: number,
    type: TournamentStageType,
    order: number,
    name: string,
    groupCount: number | null = null,
    advanceCount: number | null = null
  ): Promise<TournamentStageEntity> {
    return await manager.save(
      manager.create(TournamentStageEntity, {
        tournamentId,
        type,
        order,
        name,
        groupCount,
        advanceCount,
      })
    );
  }

  private async buildGroupMatches(
    manager: EntityManager,
    tournamentId: number,
    stageId: number,
    participants: TournamentParticipantEntity[],
    groupCount: number
  ): Promise<void> {
    for (let group = 0; group < groupCount; group++) {
      const groupParticipants: TournamentParticipantEntity[] =
        participants.filter(
          (participant: TournamentParticipantEntity): boolean =>
            participant.groupIndex === group
        );

      for (let i = 0; i < groupParticipants.length; i++) {
        for (let j = i + 1; j < groupParticipants.length; j++) {
          await manager.save(
            manager.create(TournamentMatchEntity, {
              tournamentId,
              stageId,
              groupIndex: group,
              participantOneId: groupParticipants[i].id,
              participantTwoId: groupParticipants[j].id,
            })
          );
        }
      }
    }
  }

  private async buildBracket(
    manager: EntityManager,
    tournamentId: number,
    stageId: number,
    positions: (number | null)[]
  ): Promise<void> {
    const size: number = positions.length;
    const rounds: number = Math.log2(size);
    const matchIds: number[][] = [];

    for (let round = 1; round <= rounds; round++) {
      const matchesInRound: number = size / Math.pow(2, round);
      const roundIds: number[] = [];

      for (let slot = 0; slot < matchesInRound; slot++) {
        const isFirstRound: boolean = round === 1;
        const match: TournamentMatchEntity = await manager.save(
          manager.create(TournamentMatchEntity, {
            tournamentId,
            stageId,
            round,
            slot,
            participantOneId: isFirstRound ? positions[slot * 2] ?? null : null,
            participantTwoId: isFirstRound
              ? positions[slot * 2 + 1] ?? null
              : null,
          })
        );
        roundIds.push(match.id);
      }

      matchIds.push(roundIds);
    }

    for (let round = 0; round < rounds - 1; round++) {
      for (let slot = 0; slot < matchIds[round].length; slot++) {
        await manager.update(TournamentMatchEntity, matchIds[round][slot], {
          nextMatchId: matchIds[round + 1][Math.floor(slot / 2)],
          nextSlot: (slot % 2) + 1,
        });
      }
    }

    for (let slot = 0; slot < matchIds[0].length; slot++) {
      const match: TournamentMatchEntity | null = await manager.findOne(
        TournamentMatchEntity,
        { where: { id: matchIds[0][slot] } }
      );

      if (match) {
        await this.autoAdvanceBye(manager, match);
      }
    }
  }

  private async autoAdvanceBye(
    manager: EntityManager,
    match: TournamentMatchEntity
  ): Promise<void> {
    const hasOne: boolean = match.participantOneId !== null;
    const hasTwo: boolean = match.participantTwoId !== null;

    if (hasOne !== hasTwo) {
      match.winnerId = match.participantOneId ?? match.participantTwoId;
      await manager.save(match);

      if (match.nextMatchId) {
        await this.applyToNextMatch(manager, match);
      }
    }
  }

  private async applyToNextMatch(
    manager: EntityManager,
    match: TournamentMatchEntity
  ): Promise<void> {
    if (!match.nextMatchId) {
      return;
    }

    const next: TournamentMatchEntity | null = await manager.findOne(
      TournamentMatchEntity,
      { where: { id: match.nextMatchId } }
    );

    if (!next) {
      return;
    }

    if (match.nextSlot === 1) {
      next.participantOneId = match.winnerId;
    } else {
      next.participantTwoId = match.winnerId;
    }

    await manager.save(next);
  }

  private collectQualifiers(
    tournament: TournamentEntity,
    groupCount: number,
    advanceCount: number
  ): (number | null)[] {
    const standingsByGroup: GroupStanding[][] = [];

    for (let group = 0; group < groupCount; group++) {
      standingsByGroup.push(this.buildGroupStandings(tournament, group));
    }

    const qualifiers: (number | null)[] = [];

    for (let rank = 0; rank < advanceCount; rank++) {
      for (let group = 0; group < groupCount; group++) {
        qualifiers.push(standingsByGroup[group][rank]?.participantId ?? null);
      }
    }

    return qualifiers;
  }

  private buildGroupStandings(
    tournament: TournamentEntity,
    groupIndex: number
  ): GroupStanding[] {
    const standings: Map<number, GroupStanding> = new Map();

    for (const participant of tournament.participants) {
      if (participant.groupIndex === groupIndex) {
        standings.set(participant.id, {
          participantId: participant.id,
          played: 0,
          wins: 0,
          scoreFor: 0,
          scoreAgainst: 0,
        });
      }
    }

    for (const match of tournament.matches) {
      if (
        match.groupIndex !== groupIndex ||
        match.winnerId === null ||
        match.participantOneId === null ||
        match.participantTwoId === null
      ) {
        continue;
      }

      const one: GroupStanding | undefined = standings.get(
        match.participantOneId
      );
      const two: GroupStanding | undefined = standings.get(
        match.participantTwoId
      );

      if (!one || !two) {
        continue;
      }

      one.played += 1;
      two.played += 1;
      one.scoreFor += match.scoreOne ?? 0;
      one.scoreAgainst += match.scoreTwo ?? 0;
      two.scoreFor += match.scoreTwo ?? 0;
      two.scoreAgainst += match.scoreOne ?? 0;

      if (match.winnerId === one.participantId) {
        one.wins += 1;
      } else {
        two.wins += 1;
      }
    }

    return Array.from(standings.values()).sort(
      (a: GroupStanding, b: GroupStanding): number =>
        b.wins - a.wins ||
        b.scoreFor - b.scoreAgainst - (a.scoreFor - a.scoreAgainst) ||
        b.scoreFor - a.scoreFor
    );
  }

  private seedPositions(
    participants: TournamentParticipantEntity[]
  ): (number | null)[] {
    const ordered: TournamentParticipantEntity[] = [...participants].sort(
      (a: TournamentParticipantEntity, b: TournamentParticipantEntity): number =>
        (a.seed ?? 0) - (b.seed ?? 0)
    );
    const size: number = this.nextPowerOfTwo(ordered.length);
    const seeds: number[] = this.seedOrder(size);

    return seeds.map((seed: number): number | null => {
      const index: number = seed - 1;

      return index < ordered.length ? ordered[index].id : null;
    });
  }

  private seedOrder(size: number): number[] {
    let seeds: number[] = [1, 2];

    while (seeds.length < size) {
      const sum: number = seeds.length * 2 + 1;
      const next: number[] = [];

      for (const seed of seeds) {
        next.push(seed);
        next.push(sum - seed);
      }

      seeds = next;
    }

    return seeds;
  }

  private nextPowerOfTwo(value: number): number {
    let size: number = 1;

    while (size < value) {
      size *= 2;
    }

    return Math.max(size, 2);
  }

  private async refreshStatus(id: number): Promise<void> {
    const tournament: TournamentEntity = await this.getByIdWithRelations(id);
    const bracketStage: TournamentStageEntity | undefined =
      tournament.stages.find(
        (stage: TournamentStageEntity): boolean =>
          stage.type === TournamentStageType.BRACKET
      );

    const hasResult: boolean = tournament.matches.some(
      (match: TournamentMatchEntity): boolean => match.winnerId !== null
    );

    let status: TournamentStatus = hasResult
      ? TournamentStatus.ONGOING
      : TournamentStatus.DRAFT;

    if (bracketStage) {
      const finalRound: number = Math.max(
        ...tournament.matches
          .filter(
            (match: TournamentMatchEntity): boolean =>
              match.stageId === bracketStage.id && match.round !== null
          )
          .map((match: TournamentMatchEntity): number => match.round ?? 0)
      );
      const finalMatch: TournamentMatchEntity | undefined =
        tournament.matches.find(
          (match: TournamentMatchEntity): boolean =>
            match.stageId === bracketStage.id && match.round === finalRound
        );

      if (finalMatch && finalMatch.winnerId !== null) {
        status = TournamentStatus.COMPLETED;
      }
    } else {
      const allPlayed: boolean = tournament.matches.every(
        (match: TournamentMatchEntity): boolean => match.winnerId !== null
      );

      if (allPlayed && tournament.matches.length > 0) {
        status = TournamentStatus.COMPLETED;
      }
    }

    if (status !== tournament.status) {
      await this.tournamentRepository.update(id, { status });
    }
  }
}
