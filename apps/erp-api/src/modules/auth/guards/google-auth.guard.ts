import { ConfigKey } from '@common/types/config.type';
import { Observable } from 'rxjs';

import {
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  override canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (!this.configService.get(ConfigKey.GOOGLE_CLIENT_ID)) {
      throw new ServiceUnavailableException('Google login is not configured');
    }

    return super.canActivate(context);
  }
}
