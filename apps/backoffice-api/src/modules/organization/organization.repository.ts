import { DataSource } from 'typeorm';

import { BasicRepository } from '@shared/nest';

import { Injectable } from '@nestjs/common';

import { OrganizationEntity } from './organization.entity';

@Injectable()
export class OrganizationRepository extends BasicRepository<OrganizationEntity> {
  constructor(dataSource: DataSource) {
    super(OrganizationEntity, dataSource);
  }

  async findById(id: number): Promise<OrganizationEntity | null> {
    return await this.findOne({ where: { id } });
  }

  async findBySlug(slug: string): Promise<OrganizationEntity | null> {
    return await this.findOne({ where: { slug } });
  }

  async findAll(): Promise<OrganizationEntity[]> {
    return await this.find({ order: { createdAt: 'DESC' } });
  }
}
