import type { Constructor } from '@common/types/constructor.type';
import { plainToInstance } from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { HttpSuccessResponse } from '@shared/types';

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

@Injectable()
export class ResponseInterceptor<T extends object>
  implements NestInterceptor<T, HttpSuccessResponse<T>>
{
  constructor(private readonly dto?: Constructor<T>) {}

  intercept(
    _ctx: ExecutionContext,
    handler: CallHandler
  ): Observable<HttpSuccessResponse<T>> {
    return handler.handle().pipe(
      map(
        (dto: unknown): HttpSuccessResponse<T> => ({
          error: null,
          isSuccess: true,
          data: this.dto
            ? plainToInstance<T, unknown>(this.dto, dto)
            : (null as unknown as T),
          timestamp: new Date().toISOString(),
        })
      )
    );
  }
}
