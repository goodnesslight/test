import { IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class AuthLoginCallbackResponseDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;
}
