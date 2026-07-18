import { AdminEntity } from '@modules/admin/admin.entity';
import { CurrentAdmin } from '@modules/admin/admin.decorator';
import type { Request, Response } from 'express';

import { AdminDto, AuthLoginDto } from '@backoffice/dtos';
import { ApiRoute } from '@backoffice/types';
import { ResponseInterceptor } from '@shared/nest';

import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post(ApiRoute.AUTH_LOGIN)
  @UseInterceptors(new ResponseInterceptor(AdminDto))
  async login(
    @Body() dto: AuthLoginDto,
    @Res({ passthrough: true }) response: Response
  ): Promise<AdminEntity> {
    return await this.authService.login(dto, response);
  }

  @Post(ApiRoute.AUTH_REFRESH)
  @UseInterceptors(new ResponseInterceptor(AdminDto))
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ): Promise<AdminEntity> {
    return await this.authService.refresh(request, response);
  }

  @Post(ApiRoute.AUTH_LOGOUT)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new ResponseInterceptor())
  async logout(
    @CurrentAdmin() admin: AdminEntity,
    @Res({ passthrough: true }) response: Response
  ): Promise<null> {
    return await this.authService.logout(admin, response);
  }
}
