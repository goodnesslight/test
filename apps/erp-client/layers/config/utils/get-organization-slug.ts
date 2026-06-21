import { useRequestURL } from 'nuxt/app';

import type { ConfigService } from '../composables/use-config-service';
import { ConfigKey } from '../types';

export function getOrganizationSlug(): string | null {
  const url: URL = useRequestURL();
  const configService: ConfigService = useConfigService();
  const baseDomain: string = configService.getOrThrow<string>(
    ConfigKey.BASE_DOMAIN
  );
  const host: string = url.host;

  if (host === baseDomain || !host.endsWith(`.${baseDomain}`)) {
    return null;
  }

  return host.slice(0, host.length - baseDomain.length - 1);
}
