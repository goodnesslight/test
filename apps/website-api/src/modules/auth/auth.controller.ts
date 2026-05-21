import type { Request, Response } from 'express';

import { ApiRoute } from '@shared/types';

import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { SteamGuard } from './guards/steam.guard';

@ApiTags('auth')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get(ApiRoute.AUTH_LOGIN_REQUEST)
  @UseGuards(SteamGuard)
  loginRequest(): void {
    /* empty */
  }

  @Get(ApiRoute.AUTH_LOGIN_CALLBACK)
  @UseGuards(SteamGuard)
  async loginCallback(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    await this.authService.loginCallback(req, res);
  }

  @Post(ApiRoute.AUTH_LOGOUT)
  logout(@Res({ passthrough: true }) res: Response): void {
    this.authService.logout(res);
  }
}
