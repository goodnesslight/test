import { DataSource } from 'typeorm';

import { BasicRepository } from '@shared/nest';

import { Injectable } from '@nestjs/common';

import { OrganizationInviteEntity } from './organization-invite.entity';

@Injectable()
export class OrganizationInviteRepository extends BasicRepository<OrganizationInviteEntity> {
  constructor(dataSource: DataSource) {
    super(OrganizationInviteEntity, dataSource);
  }
}
