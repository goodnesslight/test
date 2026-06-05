import { IsEnum } from 'class-validator';

import { AttendanceStatus } from '@shared/types';

export class SetAttendanceDto {
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;
}
