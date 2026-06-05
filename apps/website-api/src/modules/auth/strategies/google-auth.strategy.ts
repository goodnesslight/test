import { ConfigKey } from '@common/types/config.type';
import { UserEntity } from '@modules/user/user.entity';
import { Profile, Strategy } from 'passport-google-oauth20';

import { EnvironmentType } from '@shared/types';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { AuthService } from '../auth.service';

@Injectable()
export class GoogleAuthStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService
  ) {
    const host: string = configService.getOrThrow(ConfigKey.HOST);
    const port: number = configService.getOrThrow(ConfigKey.PORT);
    const isDevelopment: boolean =
      configService.getOrThrow(ConfigKey.NODE_ENV) ===
      EnvironmentType.DEVELOPMENT;
    const origin: string = isDevelopment
      ? `http://${host}:${port}`
      : `https://${host}`;

    super({
      clientID: configService.getOrThrow(ConfigKey.GOOGLE_CLIENT_ID),
      clientSecret: configService.getOrThrow(ConfigKey.GOOGLE_CLIENT_SECRET),
      callbackURL: `${origin}/api/auth/google/return`,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile
  ): Promise<UserEntity> {
    return await this.authService.findOrCreateGoogleUser({
      googleId: profile.id,
      email: profile.emails?.[0]?.value ?? null,
      displayName: profile.displayName ?? null,
      avatarUrl: profile.photos?.[0]?.value ?? null,
    });
  }
}
