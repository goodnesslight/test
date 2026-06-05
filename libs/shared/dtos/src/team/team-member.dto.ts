import { Exclude, Expose, Type } from 'class-transformer';

import { TeamMemberRole } from '@shared/types';

import { UserDto } from '../user/user.dto';

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
