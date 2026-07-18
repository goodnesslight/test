import { AppModule } from '@app/app.module';
import { ConfigKey } from '@common/types/config.type';
import cookieParser from 'cookie-parser';

import { ExceptionFilter, ValidationPipe } from '@shared/nest';

import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import 'reflect-metadata';

async function bootstrap(): Promise<void> {
  const app: NestExpressApplication =
    await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.enableShutdownHooks();
  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new ExceptionFilter());

  const configService: ConfigService = app.get(ConfigService);

  const host: string = configService.getOrThrow(ConfigKey.HOST);
  const port: number = configService.getOrThrow(ConfigKey.PORT);

  await app.listen(port);
  Logger.log(`Backoffice API is running on: http://${host}:${port}/api`);
}

void bootstrap();
