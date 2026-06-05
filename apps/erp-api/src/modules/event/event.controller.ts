import { ResponseInterceptor } from '@common/interceptors/response.interceptor';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@modules/user/user.decorator';
import { UserEntity } from '@modules/user/user.entity';

import {
  EventCreateDto,
  EventDto,
  EventGetListDto,
  EventSetAttendanceDto,
  EventUpdateDto,
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
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { EventEntity } from './event.entity';
import { EventService } from './event.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post(ApiRoute.TEAM_EVENTS)
  @UseInterceptors(new ResponseInterceptor(EventDto))
  async create(
    @Param('id', ParseIntPipe) teamId: number,
    @CurrentUser() user: UserEntity,
    @Body() dto: EventCreateDto
  ): Promise<EventEntity> {
    return await this.eventService.create(teamId, user, dto);
  }

  @Put(ApiRoute.EVENTS_BY_ID)
  @UseInterceptors(new ResponseInterceptor(EventDto))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
    @Body() dto: EventUpdateDto
  ): Promise<EventEntity> {
    return await this.eventService.update(id, user, dto);
  }

  @Post(ApiRoute.EVENT_ATTENDANCE)
  @UseInterceptors(new ResponseInterceptor(EventDto))
  async setAttendance(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
    @Body() dto: EventSetAttendanceDto
  ): Promise<EventEntity> {
    return await this.eventService.setAttendance(id, user, dto);
  }

  @Get(ApiRoute.TEAM_EVENTS)
  @UseInterceptors(new ResponseInterceptor(EventDto))
  async getForTeam(
    @Param('id', ParseIntPipe) teamId: number,
    @CurrentUser() user: UserEntity,
    @Query() dto: EventGetListDto
  ): Promise<EventEntity[]> {
    return await this.eventService.getForTeam(teamId, user, dto);
  }

  @Delete(ApiRoute.EVENTS_BY_ID)
  @UseInterceptors(new ResponseInterceptor())
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity
  ): Promise<null> {
    return await this.eventService.delete(id, user);
  }
}
