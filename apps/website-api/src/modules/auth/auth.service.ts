import { createHash, randomBytes } from 'node:crypto';

import { ConfigKey } from '@common/types/config.type';
import { CacheService } from '@modules/cache/cache.service';
import { CacheKey } from '@modules/cache/cache.type';
import { UserEntity } from '@modules/user/user.entity';
import { UserRepository } from '@modules/user/user.repository';
import * as argon2 from 'argon2';
import type { CookieOptions, Request, Response } from 'express';

import { AuthLoginDto, AuthRegisterDto } from '@shared/dtos';
import { CookieKey, EnvironmentType } from '@shared/types';

import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import {
  AuthTokens,
  GoogleProfile,
  JwtPayload,
  RefreshTokenRecord,
} from './auth.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
    private readonly userRepository: UserRepository
  ) {}

  async register(
    dto: AuthRegisterDto,
    response: Response
  ): Promise<UserEntity> {
    const existingByEmail: UserEntity | null =
      await this.userRepository.findByEmail(dto.email);

    if (existingByEmail) {
      throw new ConflictException('Email is already taken');
    }

    const existingByUsername: UserEntity | null =
      await this.userRepository.findByUsername(dto.username);

    if (existingByUsername) {
      throw new ConflictException('Username is already taken');
    }

    const passwordHash: string = await argon2.hash(dto.password);
    const user: UserEntity = await this.userRepository.save(
      this.userRepository.create({
        email: dto.email,
        username: dto.username,
        passwordHash,
      })
    );

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

  async googleReturn(user: UserEntity, response: Response): Promise<void> {
    this.setAuthCookies(response, await this.issueTokens(user));
    response.redirect(this.configService.getOrThrow(ConfigKey.CLIENT_URL));
  }

  async findOrCreateGoogleUser(profile: GoogleProfile): Promise<UserEntity> {
    const existing: UserEntity | null =
      await this.userRepository.findByGoogleId(profile.googleId);

    if (existing) {
      return existing;
    }

    if (profile.email) {
      const byEmail: UserEntity | null = await this.userRepository.findByEmail(
        profile.email
      );

      // The same email is already registered — link the Google account to it.
      if (byEmail) {
        byEmail.googleId = profile.googleId;
        byEmail.avatarUrl = byEmail.avatarUrl ?? profile.avatarUrl;

        return await this.userRepository.save(byEmail);
      }
    }

    const username: string = await this.generateUniqueUsername(
      profile.displayName ??
        profile.email?.split('@')[0] ??
        `player_${profile.googleId.slice(-6)}`
    );

    return await this.userRepository.save(
      this.userRepository.create({
        email: profile.email,
        googleId: profile.googleId,
        username,
        avatarUrl: profile.avatarUrl,
      })
    );
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
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async generateUniqueUsername(base: string): Promise<string> {
    const sanitized: string =
      base.replace(/[^a-zA-Z0-9_.-]/g, '').slice(0, 24) || 'player';
    let candidate: string = sanitized;

    while (await this.userRepository.findByUsername(candidate)) {
      candidate = `${sanitized}_${randomBytes(3).toString('hex')}`;
    }

    return candidate;
  }
}
