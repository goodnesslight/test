import { BasicRepository } from '@modules/database/basic/repository.basic';
import { DataSource } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { EventAttendanceEntity } from './event-attendance.entity';

@Injectable()
export class EventAttendanceRepository extends BasicRepository<EventAttendanceEntity> {
  constructor(dataSource: DataSource) {
    super(EventAttendanceEntity, dataSource);
  }

  async findByUser(userId: number): Promise<EventAttendanceEntity[]> {
    return await this.find({ where: { userId } });
  }

  async findByEventAndUser(
    eventId: number,
    userId: number
  ): Promise<EventAttendanceEntity | null> {
    return await this.findOne({ where: { eventId, userId } });
  }
}
