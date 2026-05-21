import { IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class AvatarResponseDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nameKey: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  descriptionKey: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  imagePath: string;
}
