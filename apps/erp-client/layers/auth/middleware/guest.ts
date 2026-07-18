import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app';

import type { UserDto } from '@erp/dtos';

import type { AuthService } from '../composables/use-auth-service';

import { AppRoute } from '#layers/router';

export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) {
    return;
  }

  const authService: AuthService = useAuthService();
  const user: UserDto | null =
    authService.user.value ?? (await authService.fetchMe());

  if (user) {
    return navigateTo(AppRoute.HOME);
  }
});
