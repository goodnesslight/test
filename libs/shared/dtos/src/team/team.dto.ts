import { Exclude, Expose, Type } from 'class-transformer';

import { GameType } from '@shared/types';

import { OrganizationLiteDto } from '../organization/organization-lite.dto';

import { TeamMemberDto } from './team-member.dto';

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
