import { Exclude, Expose, Type } from 'class-transformer';
import { IsEnum } from 'class-validator';

import { TeamMemberRole, TeamType } from '@erp/types';

import { GameLiteDto } from './game';
import { UserDto } from './user';

@Exclude()
export class TeamDto {
  @Expose()
  id: number;

  @Expose()
  gameId: number;

  @Expose()
  type: TeamType;

  @Expose()
  @Type(() => TeamMemberDto)
  members: TeamMemberDto[];

  @Expose()
  createdAt: Date;

  @Expose()
  @Type(() => GameLiteDto)
  game?: GameLiteDto;
}

@Exclude()
export class TeamMemberDto {
  @Expose()
  id: number;

  @Expose()
  role: TeamMemberRole;

  @Expose()
  @Type(() => UserDto)
  user: UserDto;

  @Expose()
  createdAt: Date;
}

export class TeamCreateDto {
  @IsEnum(TeamType)
  type: TeamType;
}

export class TeamUpdateMemberDto {
  @IsEnum(TeamMemberRole)
  role: TeamMemberRole;
}
