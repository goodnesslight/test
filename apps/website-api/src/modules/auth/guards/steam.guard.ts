import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthType } from '../auth.type';

@Injectable()
export class SteamGuard extends AuthGuard(AuthType.STEAM) {}
