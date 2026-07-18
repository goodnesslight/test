import { AdminEntity } from '@modules/admin/admin.entity';
import { CurrentAdmin } from '@modules/admin/admin.decorator';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

import {
  RequestCreateDto,
  RequestDto,
  RequestNoteCreateDto,
  RequestNoteDto,
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
import { RequestNoteEntity } from './request-note/request-note.entity';

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
  async getIncoming(): Promise<RequestEntity[]> {
    return await this.requestService.getIncoming();
  }

  @Get(ApiRoute.REQUESTS_MY)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new ResponseInterceptor(RequestDto))
  async getMine(@CurrentAdmin() admin: AdminEntity): Promise<RequestEntity[]> {
    return await this.requestService.getMine(admin);
  }

  @Get(ApiRoute.REQUESTS_BY_ID)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new ResponseInterceptor(RequestDto))
  async getById(
    @Param('id', ParseIntPipe) id: number
  ): Promise<RequestEntity> {
    return await this.requestService.getById(id);
  }

  @Post(ApiRoute.REQUEST_TAKE)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new ResponseInterceptor(RequestDto))
  async takeIntoWork(
    @Param('id', ParseIntPipe) id: number,
    @CurrentAdmin() admin: AdminEntity
  ): Promise<RequestEntity> {
    return await this.requestService.takeIntoWork(id, admin);
  }

  @Post(ApiRoute.REQUEST_RELEASE)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new ResponseInterceptor(RequestDto))
  async release(
    @Param('id', ParseIntPipe) id: number,
    @CurrentAdmin() admin: AdminEntity
  ): Promise<RequestEntity> {
    return await this.requestService.release(id, admin);
  }

  @Get(ApiRoute.REQUEST_NOTES)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new ResponseInterceptor(RequestNoteDto))
  async getNotes(
    @Param('id', ParseIntPipe) id: number,
    @CurrentAdmin() admin: AdminEntity
  ): Promise<RequestNoteEntity[]> {
    return await this.requestService.getNotes(id, admin);
  }

  @Post(ApiRoute.REQUEST_NOTES)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new ResponseInterceptor(RequestNoteDto))
  async createNote(
    @Param('id', ParseIntPipe) id: number,
    @CurrentAdmin() admin: AdminEntity,
    @Body() dto: RequestNoteCreateDto
  ): Promise<RequestNoteEntity> {
    return await this.requestService.createNote(id, admin, dto);
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
