import { useRuntimeConfig } from 'nuxt/app';

import { ConfigKey } from '../types';

export interface ConfigService {
  get<T extends string | number | boolean = string>(
    key: ConfigKey
  ): T | undefined;
  getOrThrow<T extends string | number | boolean = string>(key: ConfigKey): T;
}

export function useConfigService(): ConfigService {
  const config: ReturnType<typeof useRuntimeConfig> = useRuntimeConfig();

  function get<T extends string | number | boolean = string>(
    key: ConfigKey
  ): T | undefined {
    const value: string | undefined = config.public[key] as unknown as
      | string
      | undefined;

    return value === undefined ? undefined : parseConfigValue<T>(value);
  }

  function getOrThrow<T extends string | number | boolean = string>(
    key: ConfigKey
  ): T {
    const value: string | undefined = config.public[key] as unknown as
      | string
      | undefined;

    if (value === undefined) {
      throw new Error(`Config key ${key} is not found`);
    }

    return parseConfigValue<T>(value);
  }

  function parseConfigValue<T extends string | number | boolean>(
    value: string
  ): T {
    if (value === 'true' || value === 'false') {
      return (value === 'true') as T;
    }

    if (value.trim() === '') {
      return value as T;
    }

    const parsed: number = Number(value);

    return (isNaN(parsed) ? value : parsed) as T;
  }

  return {
    get,
    getOrThrow,
  };
}
