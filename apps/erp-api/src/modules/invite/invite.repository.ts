import { BasicRepository } from '@modules/database/basic/repository.basic';
import { DataSource } from 'typeorm';

import { InviteStatus } from '@erp/types';

import { Injectable } from '@nestjs/common';

import { InviteEntity } from './invite.entity';

@Injectable()
export class InviteRepository extends BasicRepository<InviteEntity> {
  constructor(dataSource: DataSource) {
    super(InviteEntity, dataSource);
  }

  async findPendingById(id: number): Promise<InviteEntity | null> {
    return await this.findOne({
      where: { id, status: InviteStatus.PENDING },
      relations: { team: { game: { organization: true } } },
    });
  }

  async findPendingByTeamAndUser(
    teamId: number,
    invitedUserId: number
  ): Promise<InviteEntity | null> {
    return await this.findOne({
      where: { teamId, invitedUserId, status: InviteStatus.PENDING },
    });
  }

  async findPendingByTeam(teamId: number): Promise<InviteEntity[]> {
    return await this.find({
      where: { teamId, status: InviteStatus.PENDING },
      relations: { invitedUser: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findPendingByUser(invitedUserId: number): Promise<InviteEntity[]> {
    return await this.find({
      where: { invitedUserId, status: InviteStatus.PENDING },
      relations: { team: { game: { organization: true } } },
      order: { createdAt: 'DESC' },
    });
  }
}
