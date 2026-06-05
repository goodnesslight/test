import { OrganizationService } from '@modules/organization/organization.service';

import {
  CreateTeamDto,
  UpdateTeamDto,
  UpdateTeamMemberDto,
} from '@shared/dtos';

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { TeamEntity } from './team.entity';
import { TeamRepository } from './team.repository';
import { TeamMemberEntity } from './team-member.entity';
import { TeamMemberRepository } from './team-member.repository';

@Injectable()
export class TeamService {
  constructor(
    private readonly teamRepository: TeamRepository,
    private readonly teamMemberRepository: TeamMemberRepository,
    private readonly organizationService: OrganizationService
  ) {}

  async createInOrganization(
    organizationId: number,
    userId: number,
    dto: CreateTeamDto
  ): Promise<TeamEntity> {
    await this.organizationService.getOwnedById(organizationId, userId);

    const team: TeamEntity = await this.teamRepository.save(
      this.teamRepository.create({
        organizationId,
        name: dto.name,
        game: dto.game,
      })
    );

    return await this.getById(team.id);
  }

  async getById(id: number): Promise<TeamEntity> {
    const team: TeamEntity | null =
      await this.teamRepository.findByIdWithRelations(id);

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    return team;
  }

  async update(
    id: number,
    userId: number,
    dto: UpdateTeamDto
  ): Promise<TeamEntity> {
    const team: TeamEntity = await this.getById(id);

    await this.organizationService.getOwnedById(team.organizationId, userId);
    await this.teamRepository.update(id, {
      name: dto.name ?? team.name,
      game: dto.game ?? team.game,
    });

    return await this.getById(id);
  }

  async delete(id: number, userId: number): Promise<void> {
    const team: TeamEntity = await this.getById(id);

    await this.organizationService.getOwnedById(team.organizationId, userId);
    await this.teamRepository.delete(id);
  }

  async updateMemberRole(
    teamId: number,
    memberId: number,
    userId: number,
    dto: UpdateTeamMemberDto
  ): Promise<TeamEntity> {
    const team: TeamEntity = await this.getById(teamId);

    await this.organizationService.getOwnedById(team.organizationId, userId);

    const member: TeamMemberEntity = this.getMemberOrThrow(team, memberId);

    await this.teamMemberRepository.update(member.id, { role: dto.role });

    return await this.getById(teamId);
  }

  async removeMember(
    teamId: number,
    memberId: number,
    userId: number
  ): Promise<TeamEntity> {
    const team: TeamEntity = await this.getById(teamId);
    const member: TeamMemberEntity = this.getMemberOrThrow(team, memberId);
    const isSelf: boolean = member.userId === userId;
    const isOwner: boolean = team.organization.ownerId === userId;

    // Members can leave on their own; everyone else is removed by the owner.
    if (!isSelf && !isOwner) {
      throw new ForbiddenException('Only the organization owner can do this');
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
