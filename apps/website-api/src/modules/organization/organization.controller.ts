import { ResponseInterceptor } from '@common/interceptors/response.interceptor';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { UserEntity } from '@modules/user/user.entity';

import {
  OrganizationCreateDto,
  OrganizationDto,
  OrganizationUpdateDto,
} from '@shared/dtos';

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

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  @UseInterceptors(new ResponseInterceptor(OrganizationDto))
  async create(
    @CurrentUser() user: UserEntity,
    @Body() dto: OrganizationCreateDto
  ): Promise<OrganizationEntity> {
    return await this.organizationService.create(user, dto);
  }

  @Get('my')
  @UseInterceptors(new ResponseInterceptor(OrganizationDto))
  async getMyOrganizations(
    @CurrentUser() user: UserEntity
  ): Promise<OrganizationEntity[]> {
    return await this.organizationService.getMyOrganizations(user.id);
  }

  @Get(':id')
  @UseInterceptors(new ResponseInterceptor(OrganizationDto))
  async getById(
    @Param('id', ParseIntPipe) id: number
  ): Promise<OrganizationEntity> {
    return await this.organizationService.getById(id);
  }

  @Put(':id')
  @UseInterceptors(new ResponseInterceptor(OrganizationDto))
  async update(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: OrganizationUpdateDto
  ): Promise<OrganizationEntity> {
    return await this.organizationService.update(id, user.id, dto);
  }

  @Delete(':id')
  @UseInterceptors(new ResponseInterceptor())
  async delete(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseIntPipe) id: number
  ): Promise<null> {
    await this.organizationService.delete(id, user.id);

    return null;
  }
}
