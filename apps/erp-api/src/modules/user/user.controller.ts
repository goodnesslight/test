import { ResponseInterceptor } from '@common/interceptors/response.interceptor';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

import { UserDto, UserUpdateProfileDto } from '@shared/dtos';
import { ApiRoute } from '@shared/types';

import {
  Body,
  Controller,
  Get,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { CurrentUser } from './user.decorator';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';

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

  @Get(ApiRoute.USERS_ME)
  @UseInterceptors(new ResponseInterceptor(UserDto))
  getMe(@CurrentUser() user: UserEntity): UserEntity {
    return user;
  }
}
