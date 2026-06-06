import type {
  UserCalendarTokenDto,
  UserDto,
  UserUpdateProfileDto,
} from '@shared/dtos';
import { ApiRoute, type HttpResponse } from '@shared/types';

import type { ApiService } from '#layers/api';
import type { AuthService } from '#layers/auth';

export interface UserService {
  updateProfile(dto: UserUpdateProfileDto): Promise<HttpResponse<UserDto>>;
  regenerateCalendarToken(): Promise<HttpResponse<UserCalendarTokenDto>>;
  getCalendarToken(): Promise<HttpResponse<UserCalendarTokenDto>>;
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

  async function regenerateCalendarToken(): Promise<
    HttpResponse<UserCalendarTokenDto>
  > {
    return await apiService.post<UserCalendarTokenDto>(
      ApiRoute.USER_CALENDAR_TOKEN
    );
  }

  async function getCalendarToken(): Promise<
    HttpResponse<UserCalendarTokenDto>
  > {
    return await apiService.get<UserCalendarTokenDto>(
      ApiRoute.USER_CALENDAR_TOKEN
    );
  }

  return { updateProfile, regenerateCalendarToken, getCalendarToken };
}
