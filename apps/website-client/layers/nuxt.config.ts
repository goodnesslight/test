import { defineNuxtConfig } from 'nuxt/config';
import type { NuxtConfig } from 'nuxt/schema';

const config: NuxtConfig = defineNuxtConfig({
  extends: ['./api', './config', './i18n', './logger', './storage'],
});

export default config;
