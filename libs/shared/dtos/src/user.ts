import { Exclude, Expose } from 'class-transformer';
import { IsEnum, IsOptional, IsString, Length } from 'class-validator';

import { Locale } from '@shared/types';

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
