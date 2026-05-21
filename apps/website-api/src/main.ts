import { AppModule } from '@app/app.module';
import { ExceptionFilter } from '@common/filters/exception.filter';
import { ValidationPipe } from '@common/pipes/validation.pipe';
import { ConfigKey } from '@common/types/config.type';
import cookieParser from 'cookie-parser';

import { EnvironmentType } from '@shared/types';

import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

import 'reflect-metadata';

async function bootstrap(): Promise<void> {
  const app: INestApplication = await NestFactory.create(AppModule);

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
  const port: number | undefined = configService.getOrThrow(ConfigKey.PORT);
  const isDevelopment: boolean =
    configService.getOrThrow(ConfigKey.NODE_ENV) ===
    EnvironmentType.DEVELOPMENT;

  if (isDevelopment) {
    const builder: Omit<OpenAPIObject, 'paths'> = new DocumentBuilder()
      .setTitle('CS2-Coach')
      .setVersion('0.0.1')
      .addBearerAuth()
      .build();
    const document: OpenAPIObject = SwaggerModule.createDocument(app, builder, {
      deepScanRoutes: true,
    });

    SwaggerModule.setup('api/docs', app, document);
  }

  const origin: string = isDevelopment
    ? `http://${host}:${port}`
    : `https://${host}`;

  await app.listen(port);
  Logger.log(`Application is running on: ${origin}/api`);
}

void bootstrap();
