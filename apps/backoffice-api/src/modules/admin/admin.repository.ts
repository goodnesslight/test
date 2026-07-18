import { DataSource } from 'typeorm';

import { BasicRepository } from '@shared/nest';

import { Injectable } from '@nestjs/common';

import { AdminEntity } from './admin.entity';

@Injectable()
export class AdminRepository extends BasicRepository<AdminEntity> {
  constructor(dataSource: DataSource) {
    super(AdminEntity, dataSource);
  }

  async findById(id: number): Promise<AdminEntity | null> {
    return await this.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<AdminEntity | null> {
    return await this.findOne({ where: { email } });
  }
}
