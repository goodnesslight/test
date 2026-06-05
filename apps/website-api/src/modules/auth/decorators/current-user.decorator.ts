import { UserEntity } from '@modules/user/user.entity';
import { Request } from 'express';

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser: ReturnType<typeof createParamDecorator> =
  createParamDecorator(
    (_data: unknown, context: ExecutionContext): UserEntity => {
      const request: Request = context.switchToHttp().getRequest<Request>();

      return request.user as UserEntity;
    }
  );
