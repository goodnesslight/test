import { Exclude, Expose, Type } from 'class-transformer';
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
  assigneeId: number | null;

  @Expose()
  message: string | null;

  @Expose()
  @Type(() => RequestAssigneeDto)
  assignee?: RequestAssigneeDto | null;
}

@Exclude()
export class RequestAssigneeDto {
  @Expose()
  id: number;

  @Expose()
  firstName: string | null;

  @Expose()
  lastName: string | null;
}

@Exclude()
export class RequestNoteDto {
  @Expose()
  id: number;

  @Expose()
  text: string;

  @Expose()
  createdAt: Date;
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

export class RequestNoteCreateDto {
  @IsString()
  @Length(1, 2000)
  text: string;
}
