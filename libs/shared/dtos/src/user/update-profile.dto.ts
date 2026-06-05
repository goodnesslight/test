import { IsEnum, IsOptional, IsString, Length } from 'class-validator';

import { Locale } from '@shared/types';

export class UpdateProfileDto {
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
