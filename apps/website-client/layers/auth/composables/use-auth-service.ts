import { useState } from 'nuxt/app';
import { computed, type ComputedRef, type Ref } from 'vue';

import type { LoginDto, RegisterDto, UserDto } from '@shared/dtos';
import { ApiRoute, type HttpResponse } from '@shared/types';

import type { ApiService } from '../../api/composables/use-api-service';
import type { ConfigService } from '../../config/composables/use-config-service';
import { ConfigKey } from '../../config/types';

export interface AuthService {
  user: Ref<UserDto | null>;
  isAuthenticated: ComputedRef<boolean>;
  register(dto: RegisterDto): Promise<HttpResponse<UserDto>>;
  login(dto: LoginDto): Promise<HttpResponse<UserDto>>;
  logout(): Promise<void>;
  fetchMe(): Promise<UserDto | null>;
  getGoogleLoginUrl(): string;
}

export function useAuthService(): AuthService {
  const apiService: ApiService = useApiService();
  const configService: ConfigService = useConfigService();

  const user: Ref<UserDto | null> = useState<UserDto | null>(
    'auth:user',
    (): UserDto | null => null
  );
  const isAuthenticated: ComputedRef<boolean> = computed(
    (): boolean => user.value !== null
  );

  async function register(dto: RegisterDto): Promise<HttpResponse<UserDto>> {
    const response: HttpResponse<UserDto> = await apiService.post<UserDto>(
      ApiRoute.AUTH_REGISTER,
      { ...dto }
    );

    if (response.isSuccess) {
      user.value = response.data;
    }

    return response;
  }

  async function login(dto: LoginDto): Promise<HttpResponse<UserDto>> {
    const response: HttpResponse<UserDto> = await apiService.post<UserDto>(
      ApiRoute.AUTH_LOGIN,
      { ...dto }
    );

    if (response.isSuccess) {
      user.value = response.data;
    }

    return response;
  }

  async function logout(): Promise<void> {
    await apiService.post<null>(ApiRoute.AUTH_LOGOUT);
    user.value = null;
  }

  async function fetchMe(): Promise<UserDto | null> {
    const meResponse: HttpResponse<UserDto> = await apiService.get<UserDto>(
      ApiRoute.AUTH_ME
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

  function getGoogleLoginUrl(): string {
    const apiUrl: string = configService.getOrThrow(ConfigKey.API_URL);

    return `${apiUrl}/${ApiRoute.AUTH_GOOGLE}`;
  }

  return {
    user,
    isAuthenticated,
    register,
    login,
    logout,
    fetchMe,
    getGoogleLoginUrl,
  };
}
