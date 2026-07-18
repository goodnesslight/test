import { Exclude, Expose, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';

import {
  TournamentFormat,
  TournamentStageType,
  TournamentStatus,
} from '@erp/types';

// Nested DTOs are declared before TournamentDto/TournamentMatchDto:
// emitDecoratorMetadata emits a direct class reference for single-object
// @Type properties, so the referenced classes must be initialized first.
@Exclude()
export class TournamentStageDto {
  @Expose()
  id: number;

  @Expose()
  type: TournamentStageType;

  @Expose()
  order: number;

  @Expose()
  name: string;

  @Expose()
  groupCount: number | null;

  @Expose()
  advanceCount: number | null;
}

@Exclude()
export class TournamentParticipantDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  seed: number | null;

  @Expose()
  groupIndex: number | null;

  @Expose()
  teamId: number | null;

  @Expose()
  logoUrl: string | null;
}

@Exclude()
export class TournamentMatchDto {
  @Expose()
  id: number;

  @Expose()
  tournamentId: number;

  @Expose()
  stageId: number;

  @Expose()
  groupIndex: number | null;

  @Expose()
  round: number | null;

  @Expose()
  slot: number | null;

  @Expose()
  participantOneId: number | null;

  @Expose()
  participantTwoId: number | null;

  @Expose()
  winnerId: number | null;

  @Expose()
  scoreOne: number | null;

  @Expose()
  scoreTwo: number | null;

  @Expose()
  startsAt: Date | null;

  @Expose()
  nextMatchId: number | null;

  @Expose()
  nextSlot: number | null;

  @Expose()
  @Type(() => TournamentParticipantDto)
  participantOne?: TournamentParticipantDto | null;

  @Expose()
  @Type(() => TournamentParticipantDto)
  participantTwo?: TournamentParticipantDto | null;
}

@Exclude()
export class TournamentDto {
  @Expose()
  id: number;

  @Expose()
  organizationId: number;

  @Expose()
  name: string;

  @Expose()
  format: TournamentFormat;

  @Expose()
  status: TournamentStatus;

  @Expose()
  startsAt: Date;

  @Expose()
  createdAt: Date;

  @Expose()
  endsAt: Date | null;

  @Expose()
  description: string | null;

  @Expose()
  @Type(() => TournamentStageDto)
  stages: TournamentStageDto[];

  @Expose()
  @Type(() => TournamentParticipantDto)
  participants: TournamentParticipantDto[];

  @Expose()
  @Type(() => TournamentMatchDto)
  matches: TournamentMatchDto[];
}

export class TournamentParticipantCreateDto {
  @IsString()
  @Length(1, 64)
  name: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  seed?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  groupIndex?: number;

  @IsOptional()
  @IsInt()
  teamId?: number;
}

export class TournamentCreateDto {
  @IsString()
  @Length(2, 64)
  name: string;

  @IsEnum(TournamentFormat)
  format: TournamentFormat;

  @IsDateString()
  startsAt: string;

  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => TournamentParticipantCreateDto)
  participants: TournamentParticipantCreateDto[];

  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  groupCount?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  advanceCount?: number;
}

export class TournamentMatchesGetDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}

export class TournamentMatchResultDto {
  @IsOptional()
  @IsInt()
  winnerId?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  scoreOne?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  scoreTwo?: number;

  @IsOptional()
  @IsDateString()
  startsAt?: string;
}
