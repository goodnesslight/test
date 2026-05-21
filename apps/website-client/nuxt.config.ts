import { defineNuxtConfig } from 'nuxt/config';
import type { NuxtConfig } from 'nuxt/schema';

const config: NuxtConfig = defineNuxtConfig({
  workspaceDir: '../../',
  devtools: { enabled: true },
  app: {
    head: {
      title: 'CS2 Coach',
      viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
    },
  },
  devServer: {
    host: 'localhost',
    port: 4200,
  },
  typescript: {
    typeCheck: false,
    tsConfig: {
      extends: '../../../tsconfig.base.json',
    },
  },
  imports: {
    dirs: [
      '~~/layers/**/composables',
      '~~/layers/**/stores',
      '~~/layers/**/types',
    ],
    presets: [{ from: 'vue-i18n', imports: ['useI18n'] }],
  },
  runtimeConfig: {
    public: {
      API_URL: process.env.API_URL,
    },
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "variables" as *;',
          loadPaths: ['./assets/scss'],
        },
      },
    },
  },
  css: [],
  extends: ['./layers'],
});

export default config;
