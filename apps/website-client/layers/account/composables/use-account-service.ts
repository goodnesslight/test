import { AccountResponseDto } from '@shared/dtos';
import { ApiRoute, HttpResponse } from '@shared/types';

export interface AccountService {
  fetchById: (id: number) => Promise<AccountResponseDto | null>;
}

export function useAccountService(): AccountService {
  const apiService: ApiService = useApiService();

  async function fetchById(id: number): Promise<AccountResponseDto | null> {
    const response: HttpResponse<AccountResponseDto> = await apiService.get(
      ApiRoute.ACCOUNT_BY_ID,
      { id }
    );
    return response.isSuccess ? response.data : null;
  }

  return {
    fetchById,
  };
}
