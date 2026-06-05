import { Exclude, Expose, Type } from 'class-transformer';

import { TeamDto } from '../team/team.dto';

@Exclude()
export class OrganizationDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  tag: string;

  @Expose()
  logoUrl: string | null;

  @Expose()
  ownerId: number;

  @Expose()
  @Type(() => TeamDto)
  teams: TeamDto[];

  @Expose()
  createdAt: Date;
}
