import { ResponseInterceptor } from '@common/interceptors/response.interceptor';
import { CurrentUser } from '@modules/user/user.decorator';
import { UserEntity } from '@modules/user/user.entity';
import type { Request, Response } from 'express';

import { AuthLoginDto, AuthRegisterDto, UserDto } from '@shared/dtos';
import { ApiRoute } from '@shared/types';

import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post(ApiRoute.AUTH_REGISTER)
  @UseInterceptors(new ResponseInterceptor(UserDto))
  async register(
    @Body() dto: AuthRegisterDto,
    @Res({ passthrough: true }) response: Response
  ): Promise<UserEntity> {
    return await this.authService.register(dto, response);
  }

  @Post(ApiRoute.AUTH_LOGIN)
  @UseInterceptors(new ResponseInterceptor(UserDto))
  async login(
    @Body() dto: AuthLoginDto,
    @Res({ passthrough: true }) response: Response
  ): Promise<UserEntity> {
    return await this.authService.login(dto, response);
  }

  @Post(ApiRoute.AUTH_REFRESH)
  @UseInterceptors(new ResponseInterceptor(UserDto))
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ): Promise<UserEntity> {
    return await this.authService.refresh(request, response);
  }

  @Post(ApiRoute.AUTH_LOGOUT)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new ResponseInterceptor())
  async logout(
    @CurrentUser() user: UserEntity,
    @Res({ passthrough: true }) response: Response
  ): Promise<null> {
    return await this.authService.logout(user, response);
  }

  @Get(ApiRoute.AUTH_GOOGLE)
  @UseGuards(GoogleAuthGuard)
  google(): void {
    // Guard redirects to the Google OAuth consent page
  }

  @Get(ApiRoute.AUTH_GOOGLE_CALLBACK)
  @UseGuards(GoogleAuthGuard)
  async googleCallback(
    @CurrentUser() user: UserEntity,
    @Res() response: Response
  ): Promise<void> {
    return await this.authService.googleCallback(user, response);
  }
}
