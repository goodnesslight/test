import { IsOptional, IsString, IsUrl, Length } from 'class-validator';

export class CreateOrganizationDto {
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
