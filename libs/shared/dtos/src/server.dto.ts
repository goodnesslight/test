import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

import { ServerType } from '@shared/types';

import { ApiProperty } from '@nestjs/swagger';

export class ServerOnlineResponseDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  count: number;
}

export class ServerListDto {
  @ApiProperty({ enum: ServerType })
  @IsEnum(ServerType)
  @IsNotEmpty()
  type: ServerType;
}

export class ServerResponseDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  map: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  ip: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  port: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  maxPlayers: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  currentPlayers: number;
}
