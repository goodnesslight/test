import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { AvatarResponseDto } from './avatar.dto';
import { InventoryResponseDto } from './inventory.dto';

export class AccountCreateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  steamId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username: string;
}

export class AccountOneDto {
  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  id: number;
}

export class AccountResponseDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  steamId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ type: InventoryResponseDto })
  @ValidateNested()
  @Type(() => InventoryResponseDto)
  inventory: InventoryResponseDto;

  @ApiProperty({ type: AvatarResponseDto })
  @ValidateNested()
  @Type(() => AvatarResponseDto)
  avatar: AvatarResponseDto;
}
