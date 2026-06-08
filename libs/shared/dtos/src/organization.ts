import { Exclude, Expose, Type } from 'class-transformer';
import { IsOptional, IsString, IsUrl, Length } from 'class-validator';

import { OrganizationRole } from '@shared/types';

import { GameDto } from './game';
import { UserDto } from './user';

@Exclude()
export class OrganizationDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  tag: string;

  @Expose()
  ownerId: number;

  @Expose()
  @Type(() => GameDto)
  games: GameDto[];

  @Expose()
  @Type(() => OrganizationMemberDto)
  members: OrganizationMemberDto[];

  @Expose()
  createdAt: Date;

  @Expose()
  logoUrl: string | null;
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
  ownerId: number;

  @Expose()
  logoUrl: string | null;

  @Expose()
  @Type(() => OrganizationMemberDto)
  members?: OrganizationMemberDto[];
}

@Exclude()
export class OrganizationMemberDto {
  @Expose()
  id: number;

  @Expose()
  role: OrganizationRole;

  @Expose()
  @Type(() => UserDto)
  user: UserDto;

  @Expose()
  createdAt: Date;
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

export class OrganizationAddAdminDto {
  @IsString()
  @Length(3, 320)
  identifier: string;
}
