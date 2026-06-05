import { IsEnum, IsOptional, IsString, Length } from 'class-validator';

import { GameType } from '@shared/types';

export class UpdateTeamDto {
  @IsOptional()
  @IsString()
  @Length(2, 48)
  name?: string;

  @IsOptional()
  @IsEnum(GameType)
  game?: GameType;
}
