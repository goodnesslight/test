import type { UserDto, UserUpdateProfileDto } from '@shared/dtos';
import { ApiRoute, type HttpResponse } from '@shared/types';

import type { ApiService } from '#layers/api';
import type { AuthService } from '#layers/auth';

export interface UserService {
  updateProfile(dto: UserUpdateProfileDto): Promise<HttpResponse<UserDto>>;
}

export function useUserService(): UserService {
  const apiService: ApiService = useApiService();
  const authService: AuthService = useAuthService();

  async function updateProfile(
    dto: UserUpdateProfileDto
  ): Promise<HttpResponse<UserDto>> {
    const response: HttpResponse<UserDto> = await apiService.put<UserDto>(
      ApiRoute.USERS_ME,
      { ...dto }
    );

    if (response.isSuccess) {
      authService.user.value = response.data;
    }

    return response;
  }

  return { updateProfile };
}
