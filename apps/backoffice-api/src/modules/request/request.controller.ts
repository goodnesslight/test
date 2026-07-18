import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

import {
  RequestCreateDto,
  RequestDto,
  RequestUpdateDto,
} from '@backoffice/dtos';
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
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { RequestEntity } from './request.entity';
import { RequestService } from './request.service';

@Controller()
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @Post(ApiRoute.REQUESTS)
  @UseInterceptors(new ResponseInterceptor(RequestDto))
  async create(@Body() dto: RequestCreateDto): Promise<RequestEntity> {
    return await this.requestService.create(dto);
  }

  @Get(ApiRoute.REQUESTS)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new ResponseInterceptor(RequestDto))
  async getAll(): Promise<RequestEntity[]> {
    return await this.requestService.getAll();
  }

  @Put(ApiRoute.REQUESTS_BY_ID)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new ResponseInterceptor(RequestDto))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RequestUpdateDto
  ): Promise<RequestEntity> {
    return await this.requestService.update(id, dto);
  }

  @Delete(ApiRoute.REQUESTS_BY_ID)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new ResponseInterceptor())
  async delete(@Param('id', ParseIntPipe) id: number): Promise<null> {
    return await this.requestService.delete(id);
  }
}
