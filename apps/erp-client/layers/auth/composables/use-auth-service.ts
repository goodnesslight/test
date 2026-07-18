import { useState } from 'nuxt/app';
import { computed, type ComputedRef, type Ref } from 'vue';

import type { AuthLoginDto, AuthRegisterDto, UserDto } from '@erp/dtos';
import { type HttpResponse } from '@shared/types';
import { ApiRoute } from '@erp/types';

import type { ApiService } from '#layers/api';

export interface AuthService {
  user: Ref<UserDto | null>;
  isAuthenticated: ComputedRef<boolean>;
  register(dto: AuthRegisterDto): Promise<HttpResponse<UserDto>>;
  login(dto: AuthLoginDto): Promise<HttpResponse<UserDto>>;
  fetchMe(): Promise<UserDto | null>;
  logout(): Promise<void>;
}

export function useAuthService(): AuthService {
  const apiService: ApiService = useApiService();

  const user: Ref<UserDto | null> = useState<UserDto | null>(
    'auth:user',
    (): UserDto | null => null
  );
  const isAuthenticated: ComputedRef<boolean> = computed(
    (): boolean => user.value !== null
  );

  async function register(
    dto: AuthRegisterDto
  ): Promise<HttpResponse<UserDto>> {
    const response: HttpResponse<UserDto> = await apiService.post<UserDto>(
      ApiRoute.AUTH_REGISTER,
      { ...dto }
    );

    if (response.isSuccess) {
      user.value = response.data;
    }

    return response;
  }

  async function login(dto: AuthLoginDto): Promise<HttpResponse<UserDto>> {
    const response: HttpResponse<UserDto> = await apiService.post<UserDto>(
      ApiRoute.AUTH_LOGIN,
      { ...dto }
    );

    if (response.isSuccess) {
      user.value = response.data;
    }

    return response;
  }

  async function fetchMe(): Promise<UserDto | null> {
    const meResponse: HttpResponse<UserDto> = await apiService.get<UserDto>(
      ApiRoute.USERS_ME
    );

    if (meResponse.isSuccess) {
      user.value = meResponse.data;

      return meResponse.data;
    }

    const refreshResponse: HttpResponse<UserDto> =
      await apiService.post<UserDto>(ApiRoute.AUTH_REFRESH);

    if (refreshResponse.isSuccess) {
      user.value = refreshResponse.data;

      return refreshResponse.data;
    }

    user.value = null;

    return null;
  }

  async function logout(): Promise<void> {
    await apiService.post<null>(ApiRoute.AUTH_LOGOUT);
    user.value = null;
  }

  return {
    user,
    isAuthenticated,
    register,
    login,
    fetchMe,
    logout,
  };
}
