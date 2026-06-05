import { IsEnum, IsString, Length } from 'class-validator';

import { GameType } from '@shared/types';

export class CreateTeamDto {
  @IsString()
  @Length(2, 48)
  name: string;

  @IsEnum(GameType)
  game: GameType;
}
