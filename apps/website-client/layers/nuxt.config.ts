import { defineNuxtConfig } from 'nuxt/config';
import type { NuxtConfig } from 'nuxt/schema';

const config: NuxtConfig = defineNuxtConfig({
  extends: [
    './api',
    './account',
    './auth',
    './config',
    './i18n',
    './logger',
    './match',
    './profile',
    './play',
    './server',
    './sidebar',
    './storage',
  ],
});

export default config;
