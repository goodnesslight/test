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
      // Custom param decorators (e.g. @CurrentUser) return entities without
      // class-validator metadata; validating them strips all properties.
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
