import { Exclude, Expose, Type } from 'class-transformer';

import { AttendanceStatus } from '@shared/types';

import { UserDto } from '../user/user.dto';

@Exclude()
export class EventAttendanceDto {
  @Expose()
  id: number;

  @Expose()
  userId: number;

  @Expose()
  status: AttendanceStatus;

  @Expose()
  @Type(() => UserDto)
  user?: UserDto;

  @Expose()
  createdAt: Date;
}
