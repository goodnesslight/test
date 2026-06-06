import { Exclude, Expose, Type } from 'class-transformer';
import { IsOptional, IsString, IsUrl, Length } from 'class-validator';

import { GameDto } from './game';

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
