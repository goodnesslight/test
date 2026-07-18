import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

import { OrganizationCreateDto, OrganizationDto } from '@backoffice/dtos';
import { ApiRoute } from '@backoffice/types';
import { ResponseInterceptor } from '@shared/nest';

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

  @Delete(ApiRoute.ORGANIZATIONS_BY_ID)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new ResponseInterceptor())
  async delete(@Param('id', ParseIntPipe) id: number): Promise<null> {
    return await this.organizationService.delete(id);
  }
}
