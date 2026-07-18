import { ConfigKey } from '@common/types/config.type';
import { AdminEntity } from '@modules/admin/admin.entity';
import { AdminService } from '@modules/admin/admin.service';
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
    private readonly adminService: AdminService
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

  async validate(payload: JwtPayload): Promise<AdminEntity> {
    try {
      return await this.adminService.getById(payload.sub);
    } catch {
      throw new UnauthorizedException('Admin not found');
    }
  }
}
