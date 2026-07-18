import { Exclude, Expose } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
} from 'class-validator';

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
  createdAt: Date;

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

  @IsString()
  @Length(2, 48)
  @Matches(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, {
    message: 'slug can only contain lowercase letters, numbers and dashes',
  })
  slug: string;

  @IsEmail()
  ownerEmail: string;

  @IsString()
  @Length(3, 32)
  @Matches(/^[a-zA-Z0-9_.-]+$/, {
    message:
      'username can only contain letters, numbers, dots, dashes and underscores',
  })
  ownerUsername: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  @Length(1, 64)
  ownerFirstName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 64)
  ownerLastName?: string;
}
