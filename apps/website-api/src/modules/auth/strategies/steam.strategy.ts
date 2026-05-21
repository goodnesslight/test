import { ConfigKey } from '@common/types/config.type';
import { AccountEntity } from '@modules/account/account.entity';
import { AccountService } from '@modules/account/account.service';
import { Strategy } from 'passport-steam';

import { ApiRoute, EnvironmentType } from '@shared/types';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { AuthSteamAccountPayload, AuthType } from '../auth.type';

@Injectable()
export class SteamStrategy extends PassportStrategy(Strategy, AuthType.STEAM) {
  constructor(
    private readonly accountService: AccountService,
    private readonly configService: ConfigService
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
      realm: `${origin}/`,
      returnURL: `${origin}/api/${ApiRoute.AUTH_LOGIN_CALLBACK}`,
      apiKey: configService.getOrThrow(ConfigKey.STEAM_API_KEY),
    });
  }

  async validate(
    _identifier: string,
    payload: AuthSteamAccountPayload
  ): Promise<AccountEntity> {
    const account: AccountEntity | null =
      await this.accountService.getBySteamId(payload.id);

    if (account) {
      return account;
    }

    return this.accountService.create({
      steamId: payload.id,
      username: payload.displayName,
    });
  }
}
