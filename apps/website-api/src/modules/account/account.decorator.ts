import { AccountEntity } from '@modules/account/account.entity';

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentAccount: (...dataOrPipes: unknown[]) => ParameterDecorator =
  createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): AccountEntity => {
      return ctx.switchToHttp().getRequest().user;
    }
  );
