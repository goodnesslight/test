import { ConfigKey } from '@common/types/config.type';
import { UserEntity } from '@modules/user/user.entity';
import { UserRepository } from '@modules/user/user.repository';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';

import { CookieKey } from '@shared/types';

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { JwtPayload } from '../auth.type';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly userRepository: UserRepository
  ) {
    super({
      jwtFromRequest: (request: Request): string | null =>
        request.cookies?.[CookieKey.ACCESS_TOKEN] ?? null,
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>(
        ConfigKey.AUTH_ACCESS_TOKEN_SECRET
      ),
    });
  }

  async validate(payload: JwtPayload): Promise<UserEntity> {
    const user: UserEntity | null = await this.userRepository.findById(
      payload.sub
    );

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
