import { CookieRef } from 'nuxt/app';
import type { ComputedRef } from 'vue';

import { ApiRoute, CookieKey } from '@shared/types';

export interface AuthService {
  isLoggedIn: ComputedRef<boolean>;
  accountId: ComputedRef<number | null>;
  login: () => void;
  logout: () => Promise<void>;
}

export function useAuthService(): AuthService {
  const configService: ConfigService = useConfigService();
  const apiService: ApiService = useApiService();

  const apiUrl: string = configService.getOrThrow(ConfigKey.API_URL);

  const tokenCookie: CookieRef<string | null> = useCookie(
    CookieKey.API_AUTH_TOKEN
  );

  const isLoggedIn: ComputedRef<boolean> = computed(
    () => tokenCookie.value !== null && tokenCookie.value !== undefined
  );

  const accountId: ComputedRef<number | null> = computed(() => {
    if (!tokenCookie.value) {
      return null;
    }

    try {
      const payload: { accountId: number } = JSON.parse(
        atob(tokenCookie.value.split('.')[1])
      );
      return payload.accountId;
    } catch {
      return null;
    }
  });

  function login(): void {
    window.location.href = `${apiUrl}/${ApiRoute.AUTH_LOGIN_REQUEST}`;
  }

  async function logout(): Promise<void> {
    await apiService.post(ApiRoute.AUTH_LOGOUT);
    tokenCookie.value = null;
  }

  return { isLoggedIn, accountId, login, logout };
}
