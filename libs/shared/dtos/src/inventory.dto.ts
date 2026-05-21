import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { ItemResponseDto } from './item.dto';

export class InventoryResponseDto {
  @ApiProperty({ type: [ItemResponseDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemResponseDto)
  items: ItemResponseDto[];
}
