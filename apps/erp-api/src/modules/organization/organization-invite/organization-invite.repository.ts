import { BasicRepository } from '@modules/database/basic/repository.basic';
import { DataSource } from 'typeorm';

import { InviteStatus } from '@shared/types';

import { Injectable } from '@nestjs/common';

import { OrganizationInviteEntity } from './organization-invite.entity';

@Injectable()
export class OrganizationInviteRepository extends BasicRepository<OrganizationInviteEntity> {
  constructor(dataSource: DataSource) {
    super(OrganizationInviteEntity, dataSource);
  }

  async findPendingByToken(
    token: string
  ): Promise<OrganizationInviteEntity | null> {
    return await this.findOne({
      where: { token, status: InviteStatus.PENDING },
      relations: { organization: true },
    });
  }

  async findPendingByOrganizationAndEmail(
    organizationId: number,
    email: string
  ): Promise<OrganizationInviteEntity | null> {
    return await this.findOne({
      where: { organizationId, email, status: InviteStatus.PENDING },
    });
  }

  async findPendingByEmail(
    email: string
  ): Promise<OrganizationInviteEntity | null> {
    return await this.findOne({
      where: { email, status: InviteStatus.PENDING },
      relations: { organization: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findPendingByOrganization(
    organizationId: number
  ): Promise<OrganizationInviteEntity[]> {
    return await this.find({
      where: { organizationId, status: InviteStatus.PENDING },
      order: { createdAt: 'DESC' },
    });
  }
}
