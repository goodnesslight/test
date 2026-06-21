import { useRequestURL } from 'nuxt/app';

import type { ConfigService } from '../composables/use-config-service';
import { ConfigKey } from '../types';

export function buildOrganizationUrl(slug: string): string {
  const url: URL = useRequestURL();
  const configService: ConfigService = useConfigService();
  const baseDomain: string = configService.getOrThrow<string>(
    ConfigKey.BASE_DOMAIN
  );

  return `${url.protocol}//${slug}.${baseDomain}/`;
}
