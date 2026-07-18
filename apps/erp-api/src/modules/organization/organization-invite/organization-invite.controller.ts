import { ResponseInterceptor } from '@common/interceptors/response.interceptor';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@modules/user/user.decorator';
import { UserEntity } from '@modules/user/user.entity';

import { OrganizationInviteCreateDto, OrganizationInviteDto } from '@erp/dtos';
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

import { OrganizationInviteEntity } from './organization-invite.entity';
import { OrganizationInviteService } from './organization-invite.service';

@Controller()
export class OrganizationInviteController {
  constructor(
    private readonly organizationInviteService: OrganizationInviteService
  ) {}

  @Get(ApiRoute.ORGANIZATIONS_INVITES_BY_TOKEN)
  @UseInterceptors(new ResponseInterceptor(OrganizationInviteDto))
  async getByToken(
    @Param('token') token: string
  ): Promise<OrganizationInviteEntity> {
    return await this.organizationInviteService.getByToken(token);
  }

  @Post(ApiRoute.ORGANIZATIONS_INVITES_ACCEPT)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new ResponseInterceptor(OrganizationInviteDto))
  async accept(
    @Param('token') token: string,
    @CurrentUser() user: UserEntity
  ): Promise<OrganizationInviteEntity> {
    return await this.organizationInviteService.accept(token, user);
  }

  @Post(ApiRoute.ORGANIZATION_INVITES)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new ResponseInterceptor(OrganizationInviteDto))
  async create(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
    @Body() dto: OrganizationInviteCreateDto
  ): Promise<OrganizationInviteEntity> {
    return await this.organizationInviteService.create(id, user, dto);
  }

  @Get(ApiRoute.ORGANIZATION_INVITES)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new ResponseInterceptor(OrganizationInviteDto))
  async getForOrganization(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity
  ): Promise<OrganizationInviteEntity[]> {
    return await this.organizationInviteService.getForOrganization(id, user);
  }

  @Delete(ApiRoute.ORGANIZATION_INVITES_BY_ID)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new ResponseInterceptor())
  async revoke(
    @Param('id', ParseIntPipe) id: number,
    @Param('inviteId', ParseIntPipe) inviteId: number,
    @CurrentUser() user: UserEntity
  ): Promise<null> {
    return await this.organizationInviteService.revoke(id, inviteId, user);
  }
}
