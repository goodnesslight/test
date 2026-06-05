import { Exclude, Expose, Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, Length } from 'class-validator';

import { GameType, TeamMemberRole } from '@shared/types';

import { OrganizationLiteDto } from './organization';
import { UserDto } from './user';

@Exclude()
export class TeamDto {
  @Expose()
  id: number;

  @Expose()
  organizationId: number;

  @Expose()
  name: string;

  @Expose()
  game: GameType;

  @Expose()
  @Type(() => OrganizationLiteDto)
  organization?: OrganizationLiteDto;

  @Expose()
  @Type(() => TeamMemberDto)
  members: TeamMemberDto[];

  @Expose()
  createdAt: Date;
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
  @IsString()
  @Length(2, 48)
  name: string;

  @IsEnum(GameType)
  game: GameType;
}

export class TeamUpdateDto {
  @IsOptional()
  @IsString()
  @Length(2, 48)
  name?: string;

  @IsOptional()
  @IsEnum(GameType)
  game?: GameType;
}

export class TeamUpdateMemberDto {
  @IsEnum(TeamMemberRole)
  role: TeamMemberRole;
}
