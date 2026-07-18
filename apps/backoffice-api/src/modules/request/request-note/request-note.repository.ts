import { DataSource } from 'typeorm';

import { BasicRepository } from '@shared/nest';

import { Injectable } from '@nestjs/common';

import { RequestNoteEntity } from './request-note.entity';

@Injectable()
export class RequestNoteRepository extends BasicRepository<RequestNoteEntity> {
  constructor(dataSource: DataSource) {
    super(RequestNoteEntity, dataSource);
  }

  async findByRequestAndAdmin(
    requestId: number,
    adminId: number
  ): Promise<RequestNoteEntity[]> {
    return await this.find({
      where: { requestId, adminId },
      order: { createdAt: 'ASC' },
    });
  }
}
