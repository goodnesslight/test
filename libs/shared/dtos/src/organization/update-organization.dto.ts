import { IsOptional, IsString, IsUrl, Length } from 'class-validator';

export class UpdateOrganizationDto {
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
