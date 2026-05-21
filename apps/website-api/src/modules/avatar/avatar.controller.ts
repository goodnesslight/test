import { ResponseInterceptor } from '@common/interceptors/response.interceptor';
import { JwtGuard } from '@modules/auth/guards/jwt.guard';

import { AvatarResponseDto } from '@shared/dtos';
import { ApiRoute } from '@shared/types';

import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { AvatarService } from './avatar.service';

@Controller()
@ApiBearerAuth()
@ApiTags('avatars')
@UseGuards(JwtGuard)
export class AvatarController {
  constructor(private readonly avatarService: AvatarService) {}

  @Get(ApiRoute.AVATAR_LIST)
  @UseInterceptors(new ResponseInterceptor(AvatarResponseDto))
  async getList(): Promise<AvatarResponseDto[]> {
    return await this.avatarService.getList();
  }
}
