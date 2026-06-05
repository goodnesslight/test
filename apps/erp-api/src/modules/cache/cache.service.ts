import Redis from 'ioredis';

import { Inject, Injectable } from '@nestjs/common';

import { CACHE_INJECTION_KEY } from './cache.const';
import { CacheKey } from './cache.type';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_INJECTION_KEY) private readonly redis: Redis) {}

  async set<T extends object>(key: CacheKey, value: T): Promise<string> {
    return await this.redis.set(key, JSON.stringify(value));
  }

  async get<T extends object>(key: CacheKey): Promise<T | null> {
    const value: string | null = await this.redis.get(key);

    return value ? JSON.parse(value) : null;
  }

  async exists(key: CacheKey): Promise<boolean> {
    return Boolean(await this.redis.exists(key));
  }

  async del(key: CacheKey): Promise<number> {
    return await this.redis.del(key);
  }

  async hSet<T extends object>(
    key: CacheKey,
    field: string | number,
    value: T
  ): Promise<number> {
    return await this.redis.hset(key, String(field), JSON.stringify(value));
  }

  async hGet<T extends object>(
    key: CacheKey,
    field: string | number
  ): Promise<T | null> {
    const value: string | null = await this.redis.hget(key, String(field));

    return value ? JSON.parse(value) : null;
  }

  async hExists(key: CacheKey, field: string | number): Promise<boolean> {
    return Boolean(await this.redis.hexists(key, String(field)));
  }

  async hDel(key: CacheKey, ...fields: (string | number)[]): Promise<number> {
    return await this.redis.hdel(
      key,
      ...fields.map((field: string | number): string => String(field))
    );
  }
}
