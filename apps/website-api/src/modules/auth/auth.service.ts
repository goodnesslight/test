import { ConfigKey } from '@common/types/config.type';
import { AccountEntity } from '@modules/account/account.entity';
import { AccountService } from '@modules/account/account.service';
import type { Request, Response } from 'express';

import { CookieKey } from '@shared/types';

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly clientUrl: string;

  constructor(
    private readonly accountService: AccountService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {
    this.clientUrl = this.configService.getOrThrow(ConfigKey.CLIENT_URL);
  }

  async loginCallback(req: Request, res: Response): Promise<void> {
    const steamId: string | undefined = (
      req.query['openid.claimed_id'] as string
    )?.match(/\/id\/(\d+)$/)?.[1];

    if (!steamId) {
      throw new UnauthorizedException('SteamID not found');
    }

    const account: AccountEntity | null =
      await this.accountService.getBySteamId(steamId);

    if (!account) {
      throw new UnauthorizedException('Account not found');
    }

    const token: string = this.generateToken(account);
    res.cookie(CookieKey.API_AUTH_TOKEN, token, {
      sameSite: 'lax',
      httpOnly: false,
    });
    res.redirect(this.clientUrl);
  }

  logout(res: Response): void {
    res.clearCookie(CookieKey.API_AUTH_TOKEN);
  }

  generateToken(account: AccountEntity): string {
    return this.jwtService.sign({ accountId: account.id });
  }
}
