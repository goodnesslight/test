import { TeamModule } from '@modules/team/team.module';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EventController } from './event.controller';
import { EventEntity } from './event.entity';
import { EventRepository } from './event.repository';
import { EventService } from './event.service';
import { EventAttendanceEntity } from './event-attendance.entity';
import { EventAttendanceRepository } from './event-attendance.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([EventEntity, EventAttendanceEntity]),
    TeamModule,
  ],
  controllers: [EventController],
  providers: [EventService, EventRepository, EventAttendanceRepository],
  exports: [EventService],
})
export class EventModule {}
