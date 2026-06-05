import { ResponseInterceptor } from '@common/interceptors/response.interceptor';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { UserEntity } from '@modules/user/user.entity';

import { InviteCreateDto, InviteDto } from '@shared/dtos';

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

  @Post('teams/:id/invites')
  @UseInterceptors(new ResponseInterceptor(InviteDto))
  async create(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseIntPipe) teamId: number,
    @Body() dto: InviteCreateDto
  ): Promise<InviteEntity> {
    return await this.inviteService.create(teamId, user.id, dto);
  }

  @Get('teams/:id/invites')
  @UseInterceptors(new ResponseInterceptor(InviteDto))
  async getPendingForTeam(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseIntPipe) teamId: number
  ): Promise<InviteEntity[]> {
    return await this.inviteService.getPendingForTeam(teamId, user.id);
  }

  @Get('invites/my')
  @UseInterceptors(new ResponseInterceptor(InviteDto))
  async getMyPending(@CurrentUser() user: UserEntity): Promise<InviteEntity[]> {
    return await this.inviteService.getMyPending(user.id);
  }

  @Post('invites/:id/accept')
  @UseInterceptors(new ResponseInterceptor())
  async accept(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseIntPipe) id: number
  ): Promise<null> {
    await this.inviteService.accept(id, user.id);

    return null;
  }

  @Post('invites/:id/decline')
  @UseInterceptors(new ResponseInterceptor())
  async decline(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseIntPipe) id: number
  ): Promise<null> {
    await this.inviteService.decline(id, user.id);

    return null;
  }

  @Delete('invites/:id')
  @UseInterceptors(new ResponseInterceptor())
  async revoke(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseIntPipe) id: number
  ): Promise<null> {
    await this.inviteService.revoke(id, user.id);

    return null;
  }
}
