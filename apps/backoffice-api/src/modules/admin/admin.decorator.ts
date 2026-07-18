import { Request } from 'express';

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { AdminEntity } from './admin.entity';

export const CurrentAdmin: ReturnType<typeof createParamDecorator> =
  createParamDecorator(
    (_data: unknown, context: ExecutionContext): AdminEntity => {
      const request: Request = context.switchToHttp().getRequest<Request>();
      return request.user as AdminEntity;
    }
  );
