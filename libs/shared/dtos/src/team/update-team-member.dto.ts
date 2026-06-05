import { IsEnum } from 'class-validator';

import { TeamMemberRole } from '@shared/types';

export class UpdateTeamMemberDto {
  @IsEnum(TeamMemberRole)
  role: TeamMemberRole;
}
