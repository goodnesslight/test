import { TeamEntity } from '@modules/team/team.entity';
import { TeamService } from '@modules/team/team.service';
import { TeamMemberEntity } from '@modules/team/team-member.entity';
import { UserEntity } from '@modules/user/user.entity';
import { UserRepository } from '@modules/user/user.repository';
import { DataSource, EntityManager } from 'typeorm';

import { InviteCreateDto } from '@shared/dtos';
import { InviteStatus } from '@shared/types';

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
    private readonly inviteRepository: InviteRepository,
    private readonly userRepository: UserRepository,
    private readonly teamService: TeamService,
    private readonly dataSource: DataSource
  ) {}

  async create(
    teamId: number,
    userId: number,
    dto: InviteCreateDto
  ): Promise<InviteEntity> {
    const team: TeamEntity = await this.teamService.getById(teamId);

    this.assertIsOrganizationOwner(team, userId);

    const invitedUser: UserEntity | null =
      (await this.userRepository.findByUsername(dto.identifier)) ??
      (await this.userRepository.findByEmail(dto.identifier));

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
        role: dto.role,
        status: InviteStatus.PENDING,
      })
    );

    invite.invitedUser = invitedUser;

    return invite;
  }

  async getPendingForTeam(
    teamId: number,
    userId: number
  ): Promise<InviteEntity[]> {
    const team: TeamEntity = await this.teamService.getById(teamId);

    this.assertIsOrganizationOwner(team, userId);

    return await this.inviteRepository.findPendingByTeam(teamId);
  }

  async getMyPending(userId: number): Promise<InviteEntity[]> {
    return await this.inviteRepository.findPendingByUser(userId);
  }

  async accept(id: number, userId: number): Promise<void> {
    const invite: InviteEntity = await this.getOwnPending(id, userId);

    await this.dataSource.transaction(
      async (manager: EntityManager): Promise<void> => {
        await manager.save(
          manager.create(TeamMemberEntity, {
            teamId: invite.teamId,
            userId,
            role: invite.role,
          })
        );
        await manager.update(InviteEntity, id, {
          status: InviteStatus.ACCEPTED,
        });
      }
    );
  }

  async decline(id: number, userId: number): Promise<void> {
    const invite: InviteEntity = await this.getOwnPending(id, userId);

    await this.inviteRepository.update(invite.id, {
      status: InviteStatus.DECLINED,
    });
  }

  async revoke(id: number, userId: number): Promise<void> {
    const invite: InviteEntity | null =
      await this.inviteRepository.findPendingById(id);

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    if (invite.team.organization.ownerId !== userId) {
      throw new ForbiddenException('Only the organization owner can do this');
    }

    await this.inviteRepository.delete(id);
  }

  private async getOwnPending(
    id: number,
    userId: number
  ): Promise<InviteEntity> {
    const invite: InviteEntity | null =
      await this.inviteRepository.findPendingById(id);

    if (!invite || invite.invitedUserId !== userId) {
      throw new NotFoundException('Invite not found');
    }

    return invite;
  }

  private assertIsOrganizationOwner(team: TeamEntity, userId: number): void {
    if (team.organization.ownerId !== userId) {
      throw new ForbiddenException('Only the organization owner can do this');
    }
  }
}
