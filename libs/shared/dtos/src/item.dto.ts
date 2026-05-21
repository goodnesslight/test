import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { ItemRarity } from '@shared/types';

import { ApiProperty } from '@nestjs/swagger';

export class ItemResponseDto {
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

  @ApiProperty({ enum: ItemRarity })
  @IsEnum(ItemRarity)
  @IsNotEmpty()
  rarity: ItemRarity;
}
