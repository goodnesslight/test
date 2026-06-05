import { ConfigKey } from '@common/types/config.type';
import Redis from 'ioredis';

import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CACHE_INJECTION_KEY } from './cache.const';
import { CacheService } from './cache.service';

@Global()
@Module({
  providers: [
    {
      provide: CACHE_INJECTION_KEY,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Redis => {
        return new Redis({
          host: config.getOrThrow(ConfigKey.REDIS_HOST),
          port: config.getOrThrow(ConfigKey.REDIS_PORT),
        });
      },
    },
    CacheService,
  ],
  exports: [CacheService],
})
export class CacheModule {}
