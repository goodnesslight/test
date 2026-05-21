import { ResponseInterceptor } from '@common/interceptors/response.interceptor';

import {
  ServerListDto,
  ServerOnlineResponseDto,
  ServerResponseDto,
} from '@shared/dtos';
import { ApiRoute } from '@shared/types';

import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ServerService } from './server.service';

@ApiTags('servers')
@Controller()
export class ServerController {
  constructor(private readonly serverService: ServerService) {}

  @Get(ApiRoute.SERVER_ONLINE)
  @UseInterceptors(new ResponseInterceptor(ServerOnlineResponseDto))
  async getOnline(): Promise<ServerOnlineResponseDto> {
    return this.serverService.getOnline();
  }

  @Get(ApiRoute.SERVER_LIST)
  @UseInterceptors(new ResponseInterceptor(ServerResponseDto))
  async getList(@Query() dto: ServerListDto): Promise<ServerResponseDto[]> {
    return await this.serverService.getList(dto.type);
  }
}
