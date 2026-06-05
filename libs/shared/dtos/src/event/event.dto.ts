import { Exclude, Expose, Type } from 'class-transformer';

import { EventType } from '@shared/types';

import { EventAttendanceDto } from './event-attendance.dto';

@Exclude()
export class EventDto {
  @Expose()
  id: number;

  @Expose()
  teamId: number;

  @Expose()
  type: EventType;

  @Expose()
  title: string;

  @Expose()
  opponent: string | null;

  @Expose()
  startsAt: Date;

  @Expose()
  endsAt: Date | null;

  @Expose()
  description: string | null;

  @Expose()
  @Type(() => EventAttendanceDto)
  attendances: EventAttendanceDto[];

  @Expose()
  createdAt: Date;
}
