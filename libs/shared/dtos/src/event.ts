import { Exclude, Expose, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

import { EventAttendanceStatus, EventScope, EventType } from '@shared/types';

import { TeamDto } from './team';
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
  startsAt: Date;

  @Expose()
  @Type(() => EventAttendanceDto)
  attendances: EventAttendanceDto[];

  @Expose()
  createdAt: Date;

  @Expose()
  opponent: string | null;

  @Expose()
  endsAt: Date | null;

  @Expose()
  description: string | null;

  @Expose()
  seriesId: string | null;

  @Expose()
  @Type(() => TeamDto)
  team?: TeamDto;
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
  createdAt: Date;

  @Expose()
  @Type(() => UserDto)
  user?: UserDto;
}

export class EventCreateRepeatDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  daysOfWeek: number[];

  @IsDateString()
  until: string;
}

export class EventCreateDto {
  @IsEnum(EventType)
  type: EventType;

  @IsString()
  @Length(2, 64)
  title: string;

  @IsDateString()
  startsAt: string;

  @IsOptional()
  @IsString()
  @Length(2, 64)
  opponent?: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => EventCreateRepeatDto)
  repeat?: EventCreateRepeatDto;
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

  @IsOptional()
  @IsEnum(EventScope)
  scope?: EventScope;
}

export class EventDeleteDto {
  @IsOptional()
  @IsEnum(EventScope)
  scope?: EventScope;
}

export class EventGetFeedDto {
  @IsUUID()
  token: string;
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
