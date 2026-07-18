import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

import {
  OrganizationCreateDto,
  OrganizationDto,
  OrganizationSetActiveDto,
} from '@backoffice/dtos';
import { ApiRoute } from '@backoffice/types';
import { ResponseInterceptor } from '@shared/nest';

import {
  Body,
  Controller,
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
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post(ApiRoute.ORGANIZATIONS)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new ResponseInterceptor(OrganizationDto))
  async create(
    @Body() dto: OrganizationCreateDto
  ): Promise<OrganizationEntity> {
    return await this.organizationService.create(dto);
  }

  @Get(ApiRoute.ORGANIZATIONS)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new ResponseInterceptor(OrganizationDto))
  async getAll(): Promise<OrganizationEntity[]> {
    return await this.organizationService.getAll();
  }

  @Get(ApiRoute.ORGANIZATIONS_BY_ID)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new ResponseInterceptor(OrganizationDto))
  async getById(
    @Param('id', ParseIntPipe) id: number
  ): Promise<OrganizationEntity> {
    return await this.organizationService.getById(id);
  }

  @Put(ApiRoute.ORGANIZATIONS_BY_ID)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new ResponseInterceptor(OrganizationDto))
  async setActive(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: OrganizationSetActiveDto
  ): Promise<OrganizationEntity> {
    return await this.organizationService.setActive(id, dto);
  }
}
