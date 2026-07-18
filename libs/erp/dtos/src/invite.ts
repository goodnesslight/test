import { Exclude, Expose, Type } from 'class-transformer';
import { IsEmail, IsEnum, IsString, Length } from 'class-validator';

import { InviteStatus, TeamMemberRole } from '@erp/types';

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
  nickname: string;

  @Expose()
  createdAt: Date;

  @Expose()
  @Type(() => TeamDto)
  team?: TeamDto;

  @Expose()
  @Type(() => UserDto)
  invitedUser?: UserDto;
}

export class InviteCreateDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(2, 32)
  nickname: string;

  @IsEnum(TeamMemberRole)
  role: TeamMemberRole;
}
