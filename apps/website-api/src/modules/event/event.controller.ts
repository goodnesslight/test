import { ResponseInterceptor } from '@common/interceptors/response.interceptor';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { UserEntity } from '@modules/user/user.entity';

import {
  CreateEventDto,
  EventDto,
  GetEventsDto,
  SetAttendanceDto,
  UpdateEventDto,
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

  @Post('teams/:id/events')
  @UseInterceptors(new ResponseInterceptor(EventDto))
  async create(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseIntPipe) teamId: number,
    @Body() dto: CreateEventDto
  ): Promise<EventEntity> {
    return await this.eventService.create(teamId, user.id, dto);
  }

  @Get('teams/:id/events')
  @UseInterceptors(new ResponseInterceptor(EventDto))
  async getForTeam(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseIntPipe) teamId: number,
    @Query() query: GetEventsDto
  ): Promise<EventEntity[]> {
    return await this.eventService.getForTeam(
      teamId,
      user.id,
      query.from,
      query.to
    );
  }

  @Put('events/:id')
  @UseInterceptors(new ResponseInterceptor(EventDto))
  async update(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEventDto
  ): Promise<EventEntity> {
    return await this.eventService.update(id, user.id, dto);
  }

  @Delete('events/:id')
  @UseInterceptors(new ResponseInterceptor())
  async delete(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseIntPipe) id: number
  ): Promise<null> {
    await this.eventService.delete(id, user.id);

    return null;
  }

  @Post('events/:id/attendance')
  @UseInterceptors(new ResponseInterceptor(EventDto))
  async setAttendance(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetAttendanceDto
  ): Promise<EventEntity> {
    return await this.eventService.setAttendance(id, user.id, dto);
  }
}
