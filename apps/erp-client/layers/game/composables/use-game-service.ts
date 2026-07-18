import type { GameCreateDto, GameDto } from '@erp/dtos';
import { type HttpResponse } from '@shared/types';
import { ApiRoute } from '@erp/types';

import type { ApiService } from '#layers/api';

export interface GameService {
  create(
    organizationId: number,
    dto: GameCreateDto
  ): Promise<HttpResponse<GameDto>>;
  remove(id: number): Promise<HttpResponse<null>>;
}

export function useGameService(): GameService {
  const apiService: ApiService = useApiService();

  async function create(
    organizationId: number,
    dto: GameCreateDto
  ): Promise<HttpResponse<GameDto>> {
    return await apiService.post<GameDto>(ApiRoute.ORGANIZATION_GAMES, {
      id: organizationId,
      ...dto,
    });
  }

  async function remove(id: number): Promise<HttpResponse<null>> {
    return await apiService.delete<null>(ApiRoute.GAMES_BY_ID, { id });
  }

  return { create, remove };
}
