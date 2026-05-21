import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthType } from '../auth.type';

@Injectable()
export class JwtGuard extends AuthGuard(AuthType.JWT) {}
