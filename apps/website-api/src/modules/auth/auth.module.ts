import { ConfigKey } from '@common/types/config.type';
import { UserModule } from '@modules/user/user.module';

import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleAuthStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [PassportModule, JwtModule.register({}), UserModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: GoogleAuthStrategy,
      inject: [ConfigService, AuthService],
      useFactory: (
        configService: ConfigService,
        authService: AuthService
      ): GoogleAuthStrategy | null =>
        configService.get(ConfigKey.GOOGLE_CLIENT_ID)
          ? new GoogleAuthStrategy(configService, authService)
          : null,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
