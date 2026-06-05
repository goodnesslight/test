import { ResponseInterceptor } from '@common/interceptors/response.interceptor';
import { ConfigKey } from '@common/types/config.type';
import { UserEntity } from '@modules/user/user.entity';
import type { CookieOptions, Request, Response } from 'express';

import { LoginDto, RegisterDto, UserDto } from '@shared/dtos';
import { CookieKey, EnvironmentType } from '@shared/types';

import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthResult, AuthTokens } from './auth.type';
import { CurrentUser } from './decorators/current-user.decorator';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  @Post('register')
  @UseInterceptors(new ResponseInterceptor(UserDto))
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) response: Response
  ): Promise<UserEntity> {
    const result: AuthResult = await this.authService.register(dto);

    this.setAuthCookies(response, result.tokens);

    return result.user;
  }

  @Post('login')
  @UseInterceptors(new ResponseInterceptor(UserDto))
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response
  ): Promise<UserEntity> {
    const result: AuthResult = await this.authService.login(dto);

    this.setAuthCookies(response, result.tokens);

    return result.user;
  }

  @Post('refresh')
  @UseInterceptors(new ResponseInterceptor(UserDto))
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ): Promise<UserEntity> {
    const refreshToken: string | undefined =
      request.cookies?.[CookieKey.REFRESH_TOKEN];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    const result: AuthResult = await this.authService.refresh(refreshToken);

    this.setAuthCookies(response, result.tokens);

    return result.user;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new ResponseInterceptor())
  async logout(
    @CurrentUser() user: UserEntity,
    @Res({ passthrough: true }) response: Response
  ): Promise<null> {
    await this.authService.logout(user.id);
    this.clearAuthCookies(response);

    return null;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new ResponseInterceptor(UserDto))
  me(@CurrentUser() user: UserEntity): UserEntity {
    return user;
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  google(): void {
    // Guard redirects to the Google OAuth consent page.
  }

  @Get('google/return')
  @UseGuards(GoogleAuthGuard)
  async googleReturn(
    @CurrentUser() user: UserEntity,
    @Res() response: Response
  ): Promise<void> {
    const tokens: AuthTokens = await this.authService.issueTokens(user);

    this.setAuthCookies(response, tokens);
    response.redirect(this.configService.getOrThrow(ConfigKey.CLIENT_URL));
  }

  private setAuthCookies(response: Response, tokens: AuthTokens): void {
    const accessMaxAge: number =
      Number(
        this.configService.getOrThrow(ConfigKey.AUTH_ACCESS_TOKEN_EXPIRATION)
      ) * 1000;
    const refreshMaxAge: number =
      Number(
        this.configService.getOrThrow(ConfigKey.AUTH_REFRESH_TOKEN_EXPIRATION)
      ) * 1000;

    response.cookie(CookieKey.ACCESS_TOKEN, tokens.accessToken, {
      ...this.getBaseCookieOptions(),
      maxAge: accessMaxAge,
    });
    response.cookie(CookieKey.REFRESH_TOKEN, tokens.refreshToken, {
      ...this.getBaseCookieOptions(),
      maxAge: refreshMaxAge,
    });
  }

  private clearAuthCookies(response: Response): void {
    response.clearCookie(CookieKey.ACCESS_TOKEN, this.getBaseCookieOptions());
    response.clearCookie(CookieKey.REFRESH_TOKEN, this.getBaseCookieOptions());
  }

  private getBaseCookieOptions(): CookieOptions {
    const isDevelopment: boolean =
      this.configService.getOrThrow(ConfigKey.NODE_ENV) ===
      EnvironmentType.DEVELOPMENT;

    return {
      httpOnly: true,
      sameSite: 'lax',
      secure: !isDevelopment,
      path: '/',
    };
  }
}
