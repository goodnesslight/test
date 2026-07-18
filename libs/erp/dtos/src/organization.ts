import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
} from 'class-validator';

import { InviteStatus, OrganizationRole } from '@erp/types';

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
  slug: string;

  @Expose()
  @Type(() => GameDto)
  games: GameDto[];

  @Expose()
  @Type(() => OrganizationMemberDto)
  members: OrganizationMemberDto[];

  @Expose()
  createdAt: Date;

  @Expose()
  ownerId: number | null;

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
  slug: string;

  @Expose()
  ownerId: number | null;

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

@Exclude()
export class OrganizationInviteDto {
  @Expose()
  id: number;

  @Expose()
  organizationId: number;

  @Expose()
  email: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  role: OrganizationRole;

  @Expose()
  status: InviteStatus;

  @Expose()
  createdAt: Date;

  @Expose()
  expiresAt: Date;

  @Expose()
  country: string | null;

  @Expose()
  birthDate: string | null;

  @Expose()
  avatarUrl: string | null;

  @Expose()
  @Type(() => OrganizationLiteDto)
  organization?: OrganizationLiteDto;
}

export class OrganizationCreateDto {
  @IsString()
  @Length(2, 48)
  name: string;

  @IsString()
  @Length(2, 8)
  tag: string;

  @IsString()
  @Length(2, 48)
  @Matches(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, {
    message: 'slug can only contain lowercase letters, numbers and dashes',
  })
  slug: string;

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
  @IsString()
  @Length(2, 48)
  @Matches(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, {
    message: 'slug can only contain lowercase letters, numbers and dashes',
  })
  slug?: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;
}

export class OrganizationAddAdminDto {
  @IsEmail()
  email: string;
}

export class OrganizationInviteCreateDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(1, 64)
  firstName: string;

  @IsString()
  @Length(1, 64)
  lastName: string;

  @IsEnum(OrganizationRole)
  role: OrganizationRole;

  @IsOptional()
  @IsString()
  @Length(2, 64)
  country?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}
