import { OrganizationService } from '@modules/organization/organization.service';
import { TeamEntity } from '@modules/team/team.entity';
import { TeamService } from '@modules/team/team.service';
import { TeamMemberEntity } from '@modules/team/team-member/team-member.entity';
import { UserEntity } from '@modules/user/user.entity';
import { UserRepository } from '@modules/user/user.repository';
import { DataSource, EntityManager } from 'typeorm';

import { InviteCreateDto } from '@erp/dtos';
import { InviteStatus, TeamMemberRole } from '@erp/types';

import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InviteEntity } from './invite.entity';
import { InviteRepository } from './invite.repository';

@Injectable()
export class InviteService {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly teamService: TeamService,
    private readonly inviteRepository: InviteRepository,
    private readonly userRepository: UserRepository,
    private readonly dataSource: DataSource
  ) {}

  async create(
    teamId: number,
    user: UserEntity,
    dto: InviteCreateDto
  ): Promise<InviteEntity> {
    const team: TeamEntity = await this.teamService.getById(teamId);

    const isManager: boolean = await this.assertCanManageRoster(team, user);

    if (!isManager && dto.role !== TeamMemberRole.PLAYER) {
      throw new ForbiddenException('A coach can only invite players');
    }

    const invitedUser: UserEntity | null =
      await this.userRepository.findByEmail(dto.email);

    if (!invitedUser) {
      throw new NotFoundException('Player not found');
    }

    const isAlreadyMember: boolean = team.members.some(
      (member: TeamMemberEntity): boolean => member.userId === invitedUser.id
    );

    if (isAlreadyMember) {
      throw new ConflictException('Player is already in the roster');
    }

    const pendingInvite: InviteEntity | null =
      await this.inviteRepository.findPendingByTeamAndUser(
        teamId,
        invitedUser.id
      );

    if (pendingInvite) {
      throw new ConflictException('Player is already invited');
    }

    const invite: InviteEntity = await this.inviteRepository.save(
      this.inviteRepository.create({
        teamId,
        invitedUserId: invitedUser.id,
        nickname: dto.nickname,
        role: dto.role,
        status: InviteStatus.PENDING,
      })
    );

    invite.invitedUser = invitedUser;

    return invite;
  }

  async accept(id: number, user: UserEntity): Promise<null> {
    const invite: InviteEntity = await this.getOwnPending(id, user);

    await this.dataSource.transaction(
      async (manager: EntityManager): Promise<void> => {
        await manager.save(
          manager.create(TeamMemberEntity, {
            teamId: invite.teamId,
            userId: user.id,
            nickname: invite.nickname,
            role: invite.role,
          })
        );
        await manager.update(InviteEntity, id, {
          status: InviteStatus.ACCEPTED,
        });
      }
    );

    return null;
  }

  async decline(id: number, user: UserEntity): Promise<null> {
    const invite: InviteEntity = await this.getOwnPending(id, user);

    await this.inviteRepository.update(invite.id, {
      status: InviteStatus.DECLINED,
    });

    return null;
  }

  async getPendingForTeam(
    teamId: number,
    user: UserEntity
  ): Promise<InviteEntity[]> {
    const team: TeamEntity = await this.teamService.getById(teamId);

    await this.assertCanManageRoster(team, user);

    return await this.inviteRepository.findPendingByTeam(teamId);
  }

  async getMyPending(user: UserEntity): Promise<InviteEntity[]> {
    return await this.inviteRepository.findPendingByUser(user.id);
  }

  async revoke(id: number, user: UserEntity): Promise<null> {
    const invite: InviteEntity | null =
      await this.inviteRepository.findPendingById(id);

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    const team: TeamEntity = await this.teamService.getById(invite.teamId);

    await this.assertCanManageRoster(team, user);
    await this.inviteRepository.delete(id);

    return null;
  }

  private async getOwnPending(
    id: number,
    user: UserEntity
  ): Promise<InviteEntity> {
    const invite: InviteEntity | null =
      await this.inviteRepository.findPendingById(id);

    if (!invite || invite.invitedUserId !== user.id) {
      throw new NotFoundException('Invite not found');
    }

    return invite;
  }

  private async assertCanManageRoster(
    team: TeamEntity,
    user: UserEntity
  ): Promise<boolean> {
    const isManager: boolean = await this.organizationService.isManager(
      team.game.organizationId,
      user.id
    );

    if (isManager) {
      return true;
    }

    const isCoach: boolean = team.members.some(
      (member: TeamMemberEntity): boolean =>
        member.userId === user.id && member.role === TeamMemberRole.COACH
    );

    if (!isCoach) {
      throw new ForbiddenException('You are not allowed to manage this roster');
    }

    return false;
  }
}
