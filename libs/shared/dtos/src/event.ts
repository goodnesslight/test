import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

import { EventAttendanceStatus, EventType } from '@shared/types';

import { UserDto } from './user';

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

@Exclude()
export class EventAttendanceDto {
  @Expose()
  id: number;

  @Expose()
  userId: number;

  @Expose()
  status: EventAttendanceStatus;

  @Expose()
  @Type(() => UserDto)
  user?: UserDto;

  @Expose()
  createdAt: Date;
}

export class EventCreateDto {
  @IsEnum(EventType)
  type: EventType;

  @IsString()
  @Length(2, 64)
  title: string;

  @IsOptional()
  @IsString()
  @Length(2, 64)
  opponent?: string;

  @IsDateString()
  startsAt: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;
}

export class EventUpdateDto {
  @IsOptional()
  @IsEnum(EventType)
  type?: EventType;

  @IsOptional()
  @IsString()
  @Length(2, 64)
  title?: string;

  @IsOptional()
  @IsString()
  @Length(2, 64)
  opponent?: string;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;
}

export class EventGetListDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}

export class EventSetAttendanceDto {
  @IsEnum(EventAttendanceStatus)
  status: EventAttendanceStatus;
}
