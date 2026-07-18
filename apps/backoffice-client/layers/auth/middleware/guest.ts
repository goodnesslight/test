import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app';

import type { AdminDto } from '@backoffice/dtos';

import type { AuthService } from '../composables/use-auth-service';

import { AppRoute } from '#layers/router';

export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) {
    return;
  }

  const authService: AuthService = useAuthService();
  const admin: AdminDto | null =
    authService.admin.value ?? (await authService.fetchMe());

  if (admin) {
    return navigateTo(AppRoute.HOME);
  }
});
