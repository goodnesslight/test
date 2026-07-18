import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsEnum, IsOptional, IsString, Length } from 'class-validator';

import { RequestStatus } from '@backoffice/types';

@Exclude()
export class RequestDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  organizationName: string;

  @Expose()
  status: RequestStatus;

  @Expose()
  createdAt: Date;

  @Expose()
  message: string | null;
}

export class RequestCreateDto {
  @IsString()
  @Length(2, 64)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(2, 48)
  organizationName: string;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  message?: string;
}

export class RequestUpdateDto {
  @IsEnum(RequestStatus)
  status: RequestStatus;
}
