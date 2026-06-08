import { Exclude, Expose, Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, Length } from 'class-validator';

import { Locale, TeamMemberRole } from '@shared/types';

import { TeamDto } from './team';

@Exclude()
export class UserDto {
  @Expose()
  id: number;

  @Expose()
  username: string;

  @Expose()
  locale: Locale;

  @Expose()
  createdAt: Date;

  @Expose()
  email: string | null;

  @Expose()
  firstName: string | null;

  @Expose()
  lastName: string | null;

  @Expose()
  avatarUrl: string | null;

  @Expose()
  googleId: string | null;
}

@Exclude()
export class UserCalendarTokenDto {
  @Expose()
  calendarToken: string;
}

// Nested profile DTOs are declared before UserProfileDto: emitDecoratorMetadata
// emits a direct class reference for the single-object `attendance` property, so
// the referenced classes must be initialized before UserProfileDto is decorated.
@Exclude()
export class UserProfileTeamDto {
  @Expose()
  teamId: number;

  @Expose()
  role: TeamMemberRole;

  @Expose()
  @Type(() => TeamDto)
  team: TeamDto;
}

@Exclude()
export class UserProfileAttendanceDto {
  @Expose()
  total: number;

  @Expose()
  going: number;

  @Expose()
  maybe: number;

  @Expose()
  declined: number;

  @Expose()
  rate: number;
}

@Exclude()
export class UserProfileDto {
  @Expose()
  id: number;

  @Expose()
  username: string;

  @Expose()
  createdAt: Date;

  @Expose()
  @Type(() => UserProfileTeamDto)
  teams: UserProfileTeamDto[];

  @Expose()
  @Type(() => UserProfileAttendanceDto)
  attendance: UserProfileAttendanceDto;

  @Expose()
  firstName: string | null;

  @Expose()
  lastName: string | null;

  @Expose()
  avatarUrl: string | null;
}

export class UserUpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(0, 64)
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(0, 64)
  lastName?: string;

  @IsOptional()
  @IsEnum(Locale)
  locale?: Locale;
}
