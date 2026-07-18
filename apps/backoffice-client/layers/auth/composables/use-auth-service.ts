import { useState } from 'nuxt/app';
import { computed, type ComputedRef, type Ref } from 'vue';

import type { AdminDto, AuthLoginDto } from '@backoffice/dtos';
import { ApiRoute } from '@backoffice/types';
import { type HttpResponse } from '@shared/types';

import type { ApiService } from '#layers/api';

export interface AuthService {
  admin: Ref<AdminDto | null>;
  isAuthenticated: ComputedRef<boolean>;
  login(dto: AuthLoginDto): Promise<HttpResponse<AdminDto>>;
  fetchMe(): Promise<AdminDto | null>;
  logout(): Promise<void>;
}

export function useAuthService(): AuthService {
  const apiService: ApiService = useApiService();

  const admin: Ref<AdminDto | null> = useState<AdminDto | null>(
    'auth:admin',
    (): AdminDto | null => null
  );
  const isAuthenticated: ComputedRef<boolean> = computed(
    (): boolean => admin.value !== null
  );

  async function login(dto: AuthLoginDto): Promise<HttpResponse<AdminDto>> {
    const response: HttpResponse<AdminDto> = await apiService.post<AdminDto>(
      ApiRoute.AUTH_LOGIN,
      { ...dto }
    );

    if (response.isSuccess) {
      admin.value = response.data;
    }

    return response;
  }

  async function fetchMe(): Promise<AdminDto | null> {
    const meResponse: HttpResponse<AdminDto> = await apiService.get<AdminDto>(
      ApiRoute.ADMINS_ME
    );

    if (meResponse.isSuccess) {
      admin.value = meResponse.data;

      return meResponse.data;
    }

    const refreshResponse: HttpResponse<AdminDto> =
      await apiService.post<AdminDto>(ApiRoute.AUTH_REFRESH);

    if (refreshResponse.isSuccess) {
      admin.value = refreshResponse.data;

      return refreshResponse.data;
    }

    admin.value = null;

    return null;
  }

  async function logout(): Promise<void> {
    await apiService.post<null>(ApiRoute.AUTH_LOGOUT);
    admin.value = null;
  }

  return {
    admin,
    isAuthenticated,
    login,
    fetchMe,
    logout,
  };
}
