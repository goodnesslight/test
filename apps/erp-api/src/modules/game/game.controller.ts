import { ResponseInterceptor } from '@common/interceptors/response.interceptor';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@modules/user/user.decorator';
import { UserEntity } from '@modules/user/user.entity';

import { GameCreateDto, GameDto } from '@shared/dtos';
import { ApiRoute } from '@shared/types';

import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { GameEntity } from './game.entity';
import { GameService } from './game.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post(ApiRoute.ORGANIZATION_GAMES)
  @UseInterceptors(new ResponseInterceptor(GameDto))
  async create(
    @Param('id', ParseIntPipe) organizationId: number,
    @CurrentUser() user: UserEntity,
    @Body() dto: GameCreateDto
  ): Promise<GameEntity> {
    return await this.gameService.create(organizationId, user, dto);
  }

  @Delete(ApiRoute.GAMES_BY_ID)
  @UseInterceptors(new ResponseInterceptor())
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity
  ): Promise<null> {
    return await this.gameService.delete(id, user);
  }
}
