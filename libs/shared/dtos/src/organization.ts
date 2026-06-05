import { Exclude, Expose, Type } from 'class-transformer';
import { IsOptional, IsString, IsUrl, Length } from 'class-validator';

import { TeamDto } from './team';

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

@Exclude()
export class OrganizationLiteDto {
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
}

export class OrganizationCreateDto {
  @IsString()
  @Length(2, 48)
  name: string;

  @IsString()
  @Length(2, 8)
  tag: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;
}

export class OrganizationUpdateDto {
  @IsOptional()
  @IsString()
  @Length(2, 48)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(2, 8)
  tag?: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;
}
