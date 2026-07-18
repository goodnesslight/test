import { GameService } from '@modules/game/game.service';
import { OrganizationService } from '@modules/organization/organization.service';
import { UserEntity } from '@modules/user/user.entity';

import { TeamCreateDto, TeamUpdateMemberDto } from '@erp/dtos';
import { TeamMemberRole } from '@erp/types';

import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { TeamEntity } from './team.entity';
import { TeamRepository } from './team.repository';
import { TeamMemberEntity } from './team-member/team-member.entity';
import { TeamMemberRepository } from './team-member/team-member.repository';

@Injectable()
export class TeamService {
  constructor(
    private readonly gameService: GameService,
    private readonly organizationService: OrganizationService,
    private readonly teamRepository: TeamRepository,
    private readonly teamMemberRepository: TeamMemberRepository
  ) {}

  async create(
    gameId: number,
    user: UserEntity,
    dto: TeamCreateDto
  ): Promise<TeamEntity> {
    await this.gameService.getManagedById(gameId, user);

    const existing: TeamEntity | null =
      await this.teamRepository.findByGameAndType(gameId, dto.type);

    if (existing) {
      throw new ConflictException(
        'Team of this type already exists in this game'
      );
    }

    const team: TeamEntity = await this.teamRepository.save(
      this.teamRepository.create({
        gameId,
        type: dto.type,
      })
    );

    return await this.getById(team.id);
  }

  async updateMemberRole(
    teamId: number,
    memberId: number,
    user: UserEntity,
    dto: TeamUpdateMemberDto
  ): Promise<TeamEntity> {
    const team: TeamEntity = await this.getById(teamId);

    await this.organizationService.assertCanManage(
      team.game.organizationId,
      user
    );

    const member: TeamMemberEntity = this.getMemberOrThrow(team, memberId);

    await this.teamMemberRepository.update(member.id, { role: dto.role });

    return await this.getById(teamId);
  }

  async getById(id: number): Promise<TeamEntity> {
    const team: TeamEntity | null =
      await this.teamRepository.findByIdWithRelations(id);

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    return team;
  }

  async delete(id: number, user: UserEntity): Promise<null> {
    const team: TeamEntity = await this.getById(id);

    await this.organizationService.assertCanManage(
      team.game.organizationId,
      user
    );
    await this.teamRepository.delete(id);

    return null;
  }

  async removeMember(
    teamId: number,
    memberId: number,
    user: UserEntity
  ): Promise<TeamEntity> {
    const team: TeamEntity = await this.getById(teamId);
    const member: TeamMemberEntity = this.getMemberOrThrow(team, memberId);
    const isSelf: boolean = member.userId === user.id;
    const isManager: boolean = await this.organizationService.isManager(
      team.game.organizationId,
      user.id
    );
    const isCoach: boolean = team.members.some(
      (candidate: TeamMemberEntity): boolean =>
        candidate.userId === user.id && candidate.role === TeamMemberRole.COACH
    );
    const canCoachRemove: boolean =
      isCoach && member.role === TeamMemberRole.PLAYER;

    if (!isSelf && !isManager && !canCoachRemove) {
      throw new ForbiddenException('You are not allowed to remove this member');
    }

    await this.teamMemberRepository.delete(member.id);

    return await this.getById(teamId);
  }

  private getMemberOrThrow(
    team: TeamEntity,
    memberId: number
  ): TeamMemberEntity {
    const member: TeamMemberEntity | undefined = team.members.find(
      (candidate: TeamMemberEntity): boolean => candidate.id === memberId
    );

    if (!member) {
      throw new NotFoundException('Team member not found');
    }

    return member;
  }
}
