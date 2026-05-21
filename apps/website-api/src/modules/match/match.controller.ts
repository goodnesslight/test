import { ResponseInterceptor } from '@common/interceptors/response.interceptor';
import { JwtGuard } from '@modules/auth/guards/jwt.guard';

import { MatchResponseDto } from '@shared/dtos';
import { ApiRoute } from '@shared/types';

import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { MatchService } from './match.service';

@ApiBearerAuth()
@ApiTags('matches')
@Controller()
@UseGuards(JwtGuard)
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Get(ApiRoute.MATCH_LIST)
  @UseInterceptors(new ResponseInterceptor(MatchResponseDto))
  async getList(): Promise<MatchResponseDto[]> {
    return await this.matchService.getList();
  }
}
