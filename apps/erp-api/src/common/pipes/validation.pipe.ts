import {
  Injectable,
  ValidationPipe as NestValidationPipe,
} from '@nestjs/common';

@Injectable()
export class ValidationPipe extends NestValidationPipe {
  constructor() {
    super({
      transform: true,
      whitelist: true,
      validateCustomDecorators: false,
      validationError: {
        target: false,
        value: false,
      },
      transformOptions: {
        enableImplicitConversion: true,
      },
    });
  }
}
