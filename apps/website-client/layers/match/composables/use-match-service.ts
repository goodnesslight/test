import { type Ref, ref } from 'vue';

import { MatchResponseDto } from '@shared/dtos';
import { ApiRoute, HttpResponse } from '@shared/types';

export interface MatchService {
  matches: Ref<MatchResponseDto[]>;
}

export function useMatchService(): MatchService {
  const authService: AuthService = useAuthService();
  const apiService: ApiService = useApiService();

  const matches: Ref<MatchResponseDto[]> = ref([]);

  async function fetchMatches(): Promise<void> {
    const response: HttpResponse<MatchResponseDto[]> = await apiService.get(
      ApiRoute.MATCH_LIST
    );
    matches.value = response.isSuccess ? response.data : [];
  }

  watch(
    () => authService.isLoggedIn.value,
    (loggedIn: boolean) => {
      if (loggedIn) {
        fetchMatches();
      } else {
        matches.value = [];
      }
    }
  );

  if (authService.isLoggedIn.value) {
    fetchMatches();
  }

  return {
    matches,
  };
}
