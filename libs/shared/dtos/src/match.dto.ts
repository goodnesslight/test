import { IsDate, IsNotEmpty } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class MatchResponseDto {
  @ApiProperty()
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;

  @ApiProperty()
  @IsDate()
  @IsNotEmpty()
  finishedAt: Date;
}
