import { Exclude, Expose, Type } from 'class-transformer';

import { InviteStatus, TeamMemberRole } from '@shared/types';

import { TeamDto } from '../team/team.dto';
import { UserDto } from '../user/user.dto';

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
