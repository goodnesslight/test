import { IsDateString, IsEnum, IsOptional, IsString, Length } from 'class-validator';

import { EventType } from '@shared/types';

export class UpdateEventDto {
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
