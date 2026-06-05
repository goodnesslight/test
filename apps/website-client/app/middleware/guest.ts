import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app';

import type { UserDto } from '@shared/dtos';

import type { AuthService } from '../../layers/auth/composables/use-auth-service';

export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) {
    return;
  }

  const authService: AuthService = useAuthService();
  const user: UserDto | null =
    authService.user.value ?? (await authService.fetchMe());

  if (user) {
    return navigateTo('/');
  }
});
