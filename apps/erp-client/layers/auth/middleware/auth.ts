import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app';

import type { UserDto } from '@shared/dtos';

import type { AuthService } from '../composables/use-auth-service';

import { AppRoute } from '#layers/router';

export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) {
    return;
  }

  const authService: AuthService = useAuthService();

  if (authService.user.value) {
    return;
  }

  const user: UserDto | null = await authService.fetchMe();

  if (!user) {
    return navigateTo(AppRoute.LOGIN);
  }
});
