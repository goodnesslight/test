import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { defineNuxtConfig } from 'nuxt/config';
import type { NuxtConfig } from 'nuxt/schema';

const themePreset: ReturnType<typeof definePreset> = definePreset(Aura, {
  primitive: {
    borderRadius: {
      none: '0',
      xs: '4px',
      sm: '6px',
      md: '10px',
      lg: '12px',
      xl: '16px',
    },
  },
  semantic: {
    primary: {
      50: '#eef3fe',
      100: '#d9e4fd',
      200: '#b3c9fb',
      300: '#8dadfa',
      400: '#6b93fa',
      500: '#4f7df9',
      600: '#3b63d8',
      700: '#2c4cab',
      800: '#1f377e',
      900: '#152552',
      950: '#0d1733',
    },
    colorScheme: {
      dark: {
        surface: {
          0: '#ffffff',
          50: '#f5f6f8',
          100: '#c9ccd4',
          200: '#9b9fab',
          300: '#7c8090',
          400: '#5b5e6a',
          500: '#3f424d',
          600: '#2c2e36',
          700: '#232529',
          800: '#1c1e23',
          900: '#17181c',
          950: '#0e0f12',
        },
      },
    },
  },
});

const config: NuxtConfig = defineNuxtConfig({
  workspaceDir: '../../',
  devtools: { enabled: true },
  modules: ['@primevue/nuxt-module'],
  primevue: {
    options: {
      ripple: true,
      theme: {
        preset: themePreset,
        options: {
          darkModeSelector: '.app-dark',
        },
      },
    },
  },
  app: {
    head: {
      title: 'Platform',
      viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
      htmlAttrs: {
        class: 'app-dark',
      },
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
  css: ['primeicons/primeicons.css'],
  extends: ['./layers'],
});

export default config;
