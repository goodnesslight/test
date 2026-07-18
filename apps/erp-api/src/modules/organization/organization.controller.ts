import { ResponseInterceptor } from '@common/interceptors/response.interceptor';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@modules/user/user.decorator';
import { UserEntity } from '@modules/user/user.entity';

import {
  OrganizationAddAdminDto,
  OrganizationCreateDto,
  OrganizationDto,
  OrganizationLiteDto,
  OrganizationUpdateDto,
} from '@erp/dtos';
import { HttpHeader } from '@shared/types';
import { ApiRoute } from '@erp/types';

import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { OrganizationEntity } from './organization.entity';
import { OrganizationService } from './organization.service';

@Controller()
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post(ApiRoute.ORGANIZATIONS)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new ResponseInterceptor(OrganizationDto))
  async create(
    @CurrentUser() user: UserEntity,
    @Body() dto: OrganizationCreateDto
  ): Promise<OrganizationEntity> {
    return await this.organizationService.create(user, dto);
  }

  @Put(ApiRoute.ORGANIZATIONS_BY_ID)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new ResponseInterceptor(OrganizationDto))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
    @Body() dto: OrganizationUpdateDto
  ): Promise<OrganizationEntity> {
    return await this.organizationService.update(id, user, dto);
  }

  @Post(ApiRoute.ORGANIZATION_ADMINS)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new ResponseInterceptor(OrganizationDto))
  async addAdmin(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
    @Body() dto: OrganizationAddAdminDto
  ): Promise<OrganizationEntity> {
    return await this.organizationService.addAdmin(id, user, dto);
  }

  @Get(ApiRoute.ORGANIZATIONS_MY)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new ResponseInterceptor(OrganizationDto))
  async getMy(@CurrentUser() user: UserEntity): Promise<OrganizationEntity[]> {
    return await this.organizationService.getMy(user);
  }

  @Get(ApiRoute.ORGANIZATIONS_CURRENT)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new ResponseInterceptor(OrganizationDto))
  async getCurrent(
    @CurrentUser() user: UserEntity,
    @Headers(HttpHeader.ORGANIZATION_SLUG) slug: string
  ): Promise<OrganizationEntity> {
    return await this.organizationService.getCurrent(user, slug);
  }

  @Get(ApiRoute.ORGANIZATIONS_PUBLIC)
  @UseInterceptors(new ResponseInterceptor(OrganizationLiteDto))
  async getPublic(
    @Headers(HttpHeader.ORGANIZATION_SLUG) slug: string
  ): Promise<OrganizationEntity> {
    return await this.organizationService.getPublicBySlug(slug);
  }

  @Get(ApiRoute.ORGANIZATIONS_BY_ID)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new ResponseInterceptor(OrganizationDto))
  async getById(
    @Param('id', ParseIntPipe) id: number
  ): Promise<OrganizationEntity> {
    return await this.organizationService.getById(id);
  }

  @Delete(ApiRoute.ORGANIZATIONS_BY_ID)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new ResponseInterceptor())
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity
  ): Promise<null> {
    return await this.organizationService.delete(id, user);
  }

  @Delete(ApiRoute.ORGANIZATION_ADMINS_BY_ID)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new ResponseInterceptor(OrganizationDto))
  async removeAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @CurrentUser() user: UserEntity
  ): Promise<OrganizationEntity> {
    return await this.organizationService.removeAdmin(id, memberId, user);
  }
}
