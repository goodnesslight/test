import { BasicRepository } from '@modules/database/basic/repository.basic';
import { DataSource } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { OrganizationMemberEntity } from './organization-member.entity';

@Injectable()
export class OrganizationMemberRepository extends BasicRepository<OrganizationMemberEntity> {
  constructor(dataSource: DataSource) {
    super(OrganizationMemberEntity, dataSource);
  }

  async findByOrganizationAndUser(
    organizationId: number,
    userId: number
  ): Promise<OrganizationMemberEntity | null> {
    return await this.findOne({ where: { organizationId, userId } });
  }
}
