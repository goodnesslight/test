import { ResponseInterceptor } from '@common/interceptors/response.interceptor';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

import {
  UserCalendarTokenDto,
  UserDto,
  UserProfileDto,
  UserUpdateProfileDto,
} from '@erp/dtos';
import { ApiRoute } from '@erp/types';

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

import { CurrentUser } from './user.decorator';
import { UserEntity } from './user.entity';
import { UserProfileResult, UserService } from './user.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Put(ApiRoute.USERS_ME)
  @UseInterceptors(new ResponseInterceptor(UserDto))
  async updateProfile(
    @CurrentUser() user: UserEntity,
    @Body() dto: UserUpdateProfileDto
  ): Promise<UserEntity> {
    return await this.userService.updateProfile(user, dto);
  }

  @Post(ApiRoute.USER_CALENDAR_TOKEN)
  @UseInterceptors(new ResponseInterceptor(UserCalendarTokenDto))
  async regenerateCalendarToken(
    @CurrentUser() user: UserEntity
  ): Promise<UserEntity> {
    return await this.userService.regenerateCalendarToken(user);
  }

  @Get(ApiRoute.USERS_ME)
  @UseInterceptors(new ResponseInterceptor(UserDto))
  getMe(@CurrentUser() user: UserEntity): UserEntity {
    return user;
  }

  @Get(ApiRoute.USER_CALENDAR_TOKEN)
  @UseInterceptors(new ResponseInterceptor(UserCalendarTokenDto))
  getCalendarToken(@CurrentUser() user: UserEntity): UserEntity {
    return user;
  }

  @Get(ApiRoute.USERS_BY_ID)
  @UseInterceptors(new ResponseInterceptor(UserProfileDto))
  async getProfileById(
    @Param('id', ParseIntPipe) id: number
  ): Promise<UserProfileResult> {
    return await this.userService.getProfileById(id);
  }
}
