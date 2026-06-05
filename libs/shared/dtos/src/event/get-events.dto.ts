import { IsDateString, IsOptional } from 'class-validator';

export class GetEventsDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
