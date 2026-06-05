import { Locale } from '@shared/types';

import type { StorageService } from '../../storage/composables/use-storage-service';
import { StorageKey } from '../../storage/types';

export interface LocaleService {
  apply(locale: Locale): void;
  restore(): void;
}

export function useLocaleService(): LocaleService {
  const { locale } = useI18n();
  const storageService: StorageService = useStorageService();

  function apply(value: Locale): void {
    locale.value = value;
    storageService.set(StorageKey.LOCALE, value);
  }

  function restore(): void {
    const stored: string | null = storageService.get(StorageKey.LOCALE);

    if (stored && Object.values(Locale).includes(stored as Locale)) {
      locale.value = stored as Locale;
    }
  }

  return { apply, restore };
}
