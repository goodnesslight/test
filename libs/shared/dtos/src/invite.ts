import { Exclude, Expose, Type } from 'class-transformer';
import { IsEnum, IsString, Length } from 'class-validator';

import { InviteStatus, TeamMemberRole } from '@shared/types';

import { TeamDto } from './team';
import { UserDto } from './user';

@Exclude()
export class InviteDto {
  @Expose()
  id: number;

  @Expose()
  teamId: number;

  @Expose()
  status: InviteStatus;

  @Expose()
  role: TeamMemberRole;

  @Expose()
  @Type(() => TeamDto)
  team?: TeamDto;

  @Expose()
  @Type(() => UserDto)
  invitedUser?: UserDto;

  @Expose()
  createdAt: Date;
}

export class InviteCreateDto {
  @IsString()
  @Length(3, 320)
  identifier: string;

  @IsEnum(TeamMemberRole)
  role: TeamMemberRole;
}
