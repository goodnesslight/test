import { ResponseInterceptor } from '@common/interceptors/response.interceptor';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@modules/user/user.decorator';
import { UserEntity } from '@modules/user/user.entity';

import {
  TournamentCreateDto,
  TournamentDto,
  TournamentMatchDto,
  TournamentMatchesGetDto,
  TournamentMatchResultDto,
} from '@erp/dtos';
import { ApiRoute } from '@erp/types';

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { TournamentEntity } from './tournament.entity';
import { TournamentService } from './tournament.service';
import { TournamentMatchEntity } from './tournament-match/tournament-match.entity';

@Controller()
@UseGuards(JwtAuthGuard)
export class TournamentController {
  constructor(private readonly tournamentService: TournamentService) {}

  @Post(ApiRoute.ORGANIZATION_TOURNAMENTS)
  @UseInterceptors(new ResponseInterceptor(TournamentDto))
  async create(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
    @Body() dto: TournamentCreateDto
  ): Promise<TournamentEntity> {
    return await this.tournamentService.create(id, user, dto);
  }

  @Get(ApiRoute.ORGANIZATION_TOURNAMENTS)
  @UseInterceptors(new ResponseInterceptor(TournamentDto))
  async getForOrganization(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity
  ): Promise<TournamentEntity[]> {
    return await this.tournamentService.getForOrganization(id, user);
  }

  @Get(ApiRoute.TOURNAMENTS_MATCHES_MY)
  @UseInterceptors(new ResponseInterceptor(TournamentMatchDto))
  async getMatchesForMember(
    @CurrentUser() user: UserEntity,
    @Query() dto: TournamentMatchesGetDto
  ): Promise<TournamentMatchEntity[]> {
    return await this.tournamentService.getMatchesForMember(user, dto);
  }

  @Get(ApiRoute.TOURNAMENTS_BY_ID)
  @UseInterceptors(new ResponseInterceptor(TournamentDto))
  async getById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity
  ): Promise<TournamentEntity> {
    return await this.tournamentService.getByIdForUser(id, user);
  }

  @Post(ApiRoute.TOURNAMENT_PLAYOFF)
  @UseInterceptors(new ResponseInterceptor(TournamentDto))
  async seedPlayoff(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity
  ): Promise<TournamentEntity> {
    return await this.tournamentService.seedPlayoff(id, user);
  }

  @Put(ApiRoute.TOURNAMENT_MATCHES_BY_ID)
  @UseInterceptors(new ResponseInterceptor(TournamentDto))
  async setMatchResult(
    @Param('id', ParseIntPipe) id: number,
    @Param('matchId', ParseIntPipe) matchId: number,
    @CurrentUser() user: UserEntity,
    @Body() dto: TournamentMatchResultDto
  ): Promise<TournamentEntity> {
    return await this.tournamentService.setMatchResult(id, matchId, user, dto);
  }

  @Delete(ApiRoute.TOURNAMENTS_BY_ID)
  @UseInterceptors(new ResponseInterceptor())
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity
  ): Promise<null> {
    return await this.tournamentService.delete(id, user);
  }
}
