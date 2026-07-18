import { ResponseInterceptor } from '@common/interceptors/response.interceptor';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@modules/user/user.decorator';
import { UserEntity } from '@modules/user/user.entity';

import { InviteCreateDto, InviteDto } from '@erp/dtos';
import { ApiRoute } from '@erp/types';

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { InviteEntity } from './invite.entity';
import { InviteService } from './invite.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class InviteController {
  constructor(private readonly inviteService: InviteService) {}

  @Post(ApiRoute.TEAM_INVITES)
  @UseInterceptors(new ResponseInterceptor(InviteDto))
  async create(
    @Param('id', ParseIntPipe) teamId: number,
    @CurrentUser() user: UserEntity,
    @Body() dto: InviteCreateDto
  ): Promise<InviteEntity> {
    return await this.inviteService.create(teamId, user, dto);
  }

  @Post(ApiRoute.INVITE_ACCEPT)
  @UseInterceptors(new ResponseInterceptor())
  async accept(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity
  ): Promise<null> {
    return await this.inviteService.accept(id, user);
  }

  @Post(ApiRoute.INVITE_DECLINE)
  @UseInterceptors(new ResponseInterceptor())
  async decline(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity
  ): Promise<null> {
    return await this.inviteService.decline(id, user);
  }

  @Get(ApiRoute.TEAM_INVITES)
  @UseInterceptors(new ResponseInterceptor(InviteDto))
  async getPendingForTeam(
    @Param('id', ParseIntPipe) teamId: number,
    @CurrentUser() user: UserEntity
  ): Promise<InviteEntity[]> {
    return await this.inviteService.getPendingForTeam(teamId, user);
  }

  @Get(ApiRoute.INVITES_MY)
  @UseInterceptors(new ResponseInterceptor(InviteDto))
  async getMyPending(@CurrentUser() user: UserEntity): Promise<InviteEntity[]> {
    return await this.inviteService.getMyPending(user);
  }

  @Delete(ApiRoute.INVITES_BY_ID)
  @UseInterceptors(new ResponseInterceptor())
  async revoke(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity
  ): Promise<null> {
    return await this.inviteService.revoke(id, user);
  }
}
