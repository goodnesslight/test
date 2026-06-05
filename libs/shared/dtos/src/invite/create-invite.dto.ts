import { IsEnum, IsString, Length } from 'class-validator';

import { TeamMemberRole } from '@shared/types';

export class CreateInviteDto {
  /** Username or email of the invited player. */
  @IsString()
  @Length(3, 320)
  identifier: string;

  @IsEnum(TeamMemberRole)
  role: TeamMemberRole;
}
