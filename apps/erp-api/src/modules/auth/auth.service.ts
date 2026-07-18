import { createHash } from 'node:crypto';

import { ConfigKey } from '@common/types/config.type';
import { CacheService } from '@modules/cache/cache.service';
import { CacheKey } from '@modules/cache/cache.type';
import { OrganizationInviteEntity } from '@modules/organization/organization-invite/organization-invite.entity';
import { OrganizationInviteService } from '@modules/organization/organization-invite/organization-invite.service';
import { UserEntity } from '@modules/user/user.entity';
import { UserRepository } from '@modules/user/user.repository';
import * as argon2 from 'argon2';
import type { CookieOptions, Request, Response } from 'express';

import { AuthLoginDto, AuthRegisterDto } from '@erp/dtos';
import { CookieKey, EnvironmentType } from '@shared/types';

import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { AuthTokens, JwtPayload, RefreshTokenRecord } from './auth.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
    private readonly organizationInviteService: OrganizationInviteService,
    private readonly userRepository: UserRepository
  ) {}

  async register(
    dto: AuthRegisterDto,
    response: Response
  ): Promise<UserEntity> {
    const invite: OrganizationInviteEntity =
      await this.organizationInviteService.getByToken(dto.inviteToken);

    const existingByEmail: UserEntity | null =
      await this.userRepository.findByEmail(invite.email);

    if (existingByEmail) {
      throw new ConflictException(
        'This email is already registered — please log in to accept the invite'
      );
    }

    const existingByUsername: UserEntity | null =
      await this.userRepository.findByUsername(invite.username);

    if (existingByUsername) {
      throw new ConflictException('Username is already taken');
    }

    const passwordHash: string = await argon2.hash(dto.password);
    const user: UserEntity = await this.userRepository.save(
      this.userRepository.create({
        email: invite.email,
        username: invite.username,
        firstName: invite.firstName,
        lastName: invite.lastName,
        country: invite.country,
        birthDate: invite.birthDate,
        avatarUrl: invite.avatarUrl,
        passwordHash,
      })
    );

    await this.organizationInviteService.consume(invite, user);
    this.setAuthCookies(response, await this.issueTokens(user));

    return user;
  }

  async login(dto: AuthLoginDto, response: Response): Promise<UserEntity> {
    const user: UserEntity | null = await this.userRepository.findByEmail(
      dto.email
    );

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid: boolean = await argon2.verify(
      user.passwordHash,
      dto.password
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    this.setAuthCookies(response, await this.issueTokens(user));

    return user;
  }

  async refresh(request: Request, response: Response): Promise<UserEntity> {
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

    const record: RefreshTokenRecord | null = await this.cacheService.hGet(
      CacheKey.AUTH_REFRESH_TOKENS,
      payload.sub
    );

    if (!record || record.hash !== this.hashToken(refreshToken)) {
      throw new UnauthorizedException('Refresh token is revoked');
    }

    const user: UserEntity | null = await this.userRepository.findById(
      payload.sub
    );

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    this.setAuthCookies(response, await this.issueTokens(user));

    return user;
  }

  async logout(user: UserEntity, response: Response): Promise<null> {
    await this.cacheService.hDel(CacheKey.AUTH_REFRESH_TOKENS, user.id);
    this.clearAuthCookies(response);

    return null;
  }

  private async issueTokens(user: UserEntity): Promise<AuthTokens> {
    const payload: JwtPayload = { sub: user.id, username: user.username };
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

    await this.cacheService.hSet<RefreshTokenRecord>(
      CacheKey.AUTH_REFRESH_TOKENS,
      user.id,
      { hash: this.hashToken(refreshToken) }
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
