import { DataSource } from 'typeorm';

import { BasicRepository } from '@shared/nest';

import { Injectable } from '@nestjs/common';

import { RequestEntity } from './request.entity';

@Injectable()
export class RequestRepository extends BasicRepository<RequestEntity> {
  constructor(dataSource: DataSource) {
    super(RequestEntity, dataSource);
  }

  async findById(id: number): Promise<RequestEntity | null> {
    return await this.findOne({ where: { id } });
  }

  async findAll(): Promise<RequestEntity[]> {
    return await this.find({ order: { createdAt: 'DESC' } });
  }
}
