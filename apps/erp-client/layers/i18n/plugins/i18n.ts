import { createI18n, type I18n } from 'vue-i18n';

import en from '../locales/en.json';
import ru from '../locales/ru.json';

const DEFAULT_LOCALE: string = 'ru';

export default defineNuxtPlugin((nuxtApp) => {
  const i18n: I18n = createI18n({
    locale: DEFAULT_LOCALE,
    fallbackLocale: DEFAULT_LOCALE,
    legacy: false,
    messages: { en, ru },
  });

  nuxtApp.vueApp.use(i18n);
});
