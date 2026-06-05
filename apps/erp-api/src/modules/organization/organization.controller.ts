import { ResponseInterceptor } from '@common/interceptors/response.interceptor';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@modules/user/user.decorator';
import { UserEntity } from '@modules/user/user.entity';

import {
  OrganizationCreateDto,
  OrganizationDto,
  OrganizationUpdateDto,
} from '@shared/dtos';
import { ApiRoute } from '@shared/types';

import {
  Body,
  Controller,
  Delete,
  Get,
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
@UseGuards(JwtAuthGuard)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post(ApiRoute.ORGANIZATIONS)
  @UseInterceptors(new ResponseInterceptor(OrganizationDto))
  async create(
    @CurrentUser() user: UserEntity,
    @Body() dto: OrganizationCreateDto
  ): Promise<OrganizationEntity> {
    return await this.organizationService.create(user, dto);
  }

  @Put(ApiRoute.ORGANIZATIONS_BY_ID)
  @UseInterceptors(new ResponseInterceptor(OrganizationDto))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
    @Body() dto: OrganizationUpdateDto
  ): Promise<OrganizationEntity> {
    return await this.organizationService.update(id, user, dto);
  }

  @Get(ApiRoute.ORGANIZATIONS_MY)
  @UseInterceptors(new ResponseInterceptor(OrganizationDto))
  async getMy(
    @CurrentUser() user: UserEntity
  ): Promise<OrganizationEntity[]> {
    return await this.organizationService.getMy(user);
  }

  @Get(ApiRoute.ORGANIZATIONS_BY_ID)
  @UseInterceptors(new ResponseInterceptor(OrganizationDto))
  async getById(
    @Param('id', ParseIntPipe) id: number
  ): Promise<OrganizationEntity> {
    return await this.organizationService.getById(id);
  }

  @Delete(ApiRoute.ORGANIZATIONS_BY_ID)
  @UseInterceptors(new ResponseInterceptor())
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity
  ): Promise<null> {
    return await this.organizationService.delete(id, user);
  }
}
