import { ResponseInterceptor } from '@common/interceptors/response.interceptor';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

import { UserDto, UserUpdateProfileDto } from '@shared/dtos';

import { Body, Controller, Put, UseGuards, UseInterceptors } from '@nestjs/common';

import { UserEntity } from './user.entity';
import { UserService } from './user.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Put('me')
  @UseInterceptors(new ResponseInterceptor(UserDto))
  async updateProfile(
    @CurrentUser() user: UserEntity,
    @Body() dto: UserUpdateProfileDto
  ): Promise<UserEntity> {
    return await this.userService.updateProfile(user, dto);
  }
}
