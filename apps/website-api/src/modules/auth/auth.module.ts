import { ConfigKey } from '@common/types/config.type';

import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SteamStrategy } from './strategies/steam.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow(ConfigKey.AUTH_TOKEN_SECRET),
        signOptions: {
          expiresIn: config.getOrThrow(ConfigKey.AUTH_TOKEN_EXPIRATION),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, SteamStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
