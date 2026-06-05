import { defineNuxtConfig } from 'nuxt/config';
import type { NuxtConfig } from 'nuxt/schema';

const config: NuxtConfig = defineNuxtConfig({
  extends: [
    './api',
    './auth',
    './config',
    './i18n',
    './logger',
    './organization',
    './storage',
    './team',
  ],
});

export default config;
