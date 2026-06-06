import { Exclude, Expose, Type } from 'class-transformer';
import { IsEnum } from 'class-validator';

import { GameType } from '@shared/types';

import { OrganizationLiteDto } from './organization';
import { TeamDto } from './team';

@Exclude()
export class GameDto {
  @Expose()
  id: number;

  @Expose()
  organizationId: number;

  @Expose()
  type: GameType;

  @Expose()
  @Type(() => TeamDto)
  teams: TeamDto[];

  @Expose()
  createdAt: Date;
}

@Exclude()
export class GameLiteDto {
  @Expose()
  id: number;

  @Expose()
  organizationId: number;

  @Expose()
  type: GameType;

  @Expose()
  @Type(() => OrganizationLiteDto)
  organization?: OrganizationLiteDto;
}

export class GameCreateDto {
  @IsEnum(GameType)
  type: GameType;
}
