import { Response } from 'express';

import { isRecord } from '@shared/utils';

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter as NestExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';

@Catch()
export class ExceptionFilter implements NestExceptionFilter {
  private readonly logger: Logger = new Logger(ExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http: HttpArgumentsHost = host.switchToHttp();
    const response: Response = http.getResponse<Response>();
    const status: number =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string;

    if (!(exception instanceof HttpException)) {
      this.logger.error(
        'Unhandled exception:',
        exception instanceof Error ? exception.stack : exception
      );
    }

    if (exception instanceof HttpException) {
      const payload: string | object = exception.getResponse();

      if (typeof payload === 'string') {
        message = payload;
      } else if (isRecord(payload) && this.hasMessage(payload)) {
        const rawMessage: string | string[] = payload.message;

        message = Array.isArray(rawMessage)
          ? rawMessage.join(', ')
          : rawMessage;
      } else {
        message = exception.message;
      }
    } else {
      message = 'Internal server error';
    }

    response.status(status).json({
      error: message,
      isSuccess: false,
      data: null,
      timestamp: new Date().toISOString(),
    });
  }

  private hasMessage(
    value: Record<string, unknown>
  ): value is { message: string | string[] } {
    return 'message' in value;
  }
}
