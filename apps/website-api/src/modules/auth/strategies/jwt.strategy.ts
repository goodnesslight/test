import { ConfigKey } from '@common/types/config.type';
import { AccountEntity } from '@modules/account/account.entity';
import { AccountService } from '@modules/account/account.service';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { CookieKey } from '@shared/types';

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { AuthJwtAccountPayload, AuthType } from '../auth.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, AuthType.JWT) {
  constructor(
    private readonly accountService: AccountService,
    private readonly configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: Request): string | null =>
          req?.cookies?.[CookieKey.API_AUTH_TOKEN] ?? null,
      ]),
      secretOrKey: configService.getOrThrow(ConfigKey.AUTH_TOKEN_SECRET),
    });
  }

  async validate(payload: AuthJwtAccountPayload): Promise<AccountEntity> {
    const account: AccountEntity | null = await this.accountService.getById(
      payload.accountId
    );

    if (!account) {
      throw new UnauthorizedException('Account not found');
    }

    return account;
  }
}
