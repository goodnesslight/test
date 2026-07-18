import { createHash } from 'node:crypto';

import { ConfigKey } from '@common/types/config.type';
import { AdminEntity } from '@modules/admin/admin.entity';
import { AdminService } from '@modules/admin/admin.service';
import * as argon2 from 'argon2';
import type { CookieOptions, Request, Response } from 'express';

import { AuthLoginDto } from '@backoffice/dtos';
import { CookieKey, EnvironmentType } from '@shared/types';

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { AuthTokens, JwtPayload } from './auth.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly adminService: AdminService
  ) {}

  async login(dto: AuthLoginDto, response: Response): Promise<AdminEntity> {
    const admin: AdminEntity | null = await this.adminService.getByEmail(
      dto.email
    );

    if (!admin) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid: boolean = await argon2.verify(
      admin.passwordHash,
      dto.password
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    this.setAuthCookies(response, await this.issueTokens(admin));

    return admin;
  }

  async refresh(request: Request, response: Response): Promise<AdminEntity> {
    const refreshToken: string | undefined =
      request.cookies?.[CookieKey.REFRESH_TOKEN];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.configService.getOrThrow(
          ConfigKey.AUTH_REFRESH_TOKEN_SECRET
        ),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const admin: AdminEntity = await this.adminService.getById(payload.sub);

    if (admin.refreshTokenHash !== this.hashToken(refreshToken)) {
      throw new UnauthorizedException('Refresh token is revoked');
    }

    this.setAuthCookies(response, await this.issueTokens(admin));

    return admin;
  }

  async logout(admin: AdminEntity, response: Response): Promise<null> {
    await this.adminService.setRefreshTokenHash(admin, null);
    this.clearAuthCookies(response);

    return null;
  }

  private async issueTokens(admin: AdminEntity): Promise<AuthTokens> {
    const payload: JwtPayload = { sub: admin.id, email: admin.email };
    const accessToken: string = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow(ConfigKey.AUTH_ACCESS_TOKEN_SECRET),
      expiresIn: Number(
        this.configService.getOrThrow(ConfigKey.AUTH_ACCESS_TOKEN_EXPIRATION)
      ),
    });
    const refreshToken: string = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow(
        ConfigKey.AUTH_REFRESH_TOKEN_SECRET
      ),
      expiresIn: Number(
        this.configService.getOrThrow(ConfigKey.AUTH_REFRESH_TOKEN_EXPIRATION)
      ),
    });

    await this.adminService.setRefreshTokenHash(
      admin,
      this.hashToken(refreshToken)
    );

    return { accessToken, refreshToken };
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
      domain: this.configService.get(ConfigKey.COOKIE_DOMAIN) || undefined,
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
