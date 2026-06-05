import { OrganizationService } from '@modules/organization/organization.service';
import { UserEntity } from '@modules/user/user.entity';

import {
  TeamCreateDto,
  TeamUpdateDto,
  TeamUpdateMemberDto,
} from '@shared/dtos';

import {
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
    private readonly organizationService: OrganizationService,
    private readonly teamRepository: TeamRepository,
    private readonly teamMemberRepository: TeamMemberRepository
  ) {}

  async create(
    organizationId: number,
    user: UserEntity,
    dto: TeamCreateDto
  ): Promise<TeamEntity> {
    await this.organizationService.getOwnedById(organizationId, user);

    const team: TeamEntity = await this.teamRepository.save(
      this.teamRepository.create({
        organizationId,
        name: dto.name,
        game: dto.game,
      })
    );

    return await this.getById(team.id);
  }

  async update(
    id: number,
    user: UserEntity,
    dto: TeamUpdateDto
  ): Promise<TeamEntity> {
    const team: TeamEntity = await this.getById(id);

    await this.organizationService.getOwnedById(team.organizationId, user);
    await this.teamRepository.update(id, {
      name: dto.name ?? team.name,
      game: dto.game ?? team.game,
    });

    return await this.getById(id);
  }

  async updateMemberRole(
    teamId: number,
    memberId: number,
    user: UserEntity,
    dto: TeamUpdateMemberDto
  ): Promise<TeamEntity> {
    const team: TeamEntity = await this.getById(teamId);

    await this.organizationService.getOwnedById(team.organizationId, user);

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

    await this.organizationService.getOwnedById(team.organizationId, user);
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
    const isOwner: boolean = team.organization.ownerId === user.id;

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
