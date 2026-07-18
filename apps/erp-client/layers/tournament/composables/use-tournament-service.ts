import type {
  TournamentCreateDto,
  TournamentDto,
  TournamentMatchDto,
  TournamentMatchesGetDto,
  TournamentMatchResultDto,
} from '@erp/dtos';
import { ApiRoute } from '@erp/types';
import { type HttpResponse } from '@shared/types';

import type { ApiService } from '#layers/api';

export interface TournamentService {
  create(
    organizationId: number,
    dto: TournamentCreateDto
  ): Promise<HttpResponse<TournamentDto>>;
  setMatchResult(
    id: number,
    matchId: number,
    dto: TournamentMatchResultDto
  ): Promise<HttpResponse<TournamentDto>>;
  seedPlayoff(id: number): Promise<HttpResponse<TournamentDto>>;
  getForOrganization(
    organizationId: number
  ): Promise<HttpResponse<TournamentDto[]>>;
  getById(id: number): Promise<HttpResponse<TournamentDto>>;
  getMatchesForMember(
    dto?: TournamentMatchesGetDto
  ): Promise<HttpResponse<TournamentMatchDto[]>>;
  remove(id: number): Promise<HttpResponse<null>>;
}

export function useTournamentService(): TournamentService {
  const apiService: ApiService = useApiService();

  async function create(
    organizationId: number,
    dto: TournamentCreateDto
  ): Promise<HttpResponse<TournamentDto>> {
    return await apiService.post<TournamentDto>(
      ApiRoute.ORGANIZATION_TOURNAMENTS,
      { id: organizationId, ...dto }
    );
  }

  async function setMatchResult(
    id: number,
    matchId: number,
    dto: TournamentMatchResultDto
  ): Promise<HttpResponse<TournamentDto>> {
    return await apiService.put<TournamentDto>(
      ApiRoute.TOURNAMENT_MATCHES_BY_ID,
      { id, matchId, ...dto }
    );
  }

  async function seedPlayoff(id: number): Promise<HttpResponse<TournamentDto>> {
    return await apiService.post<TournamentDto>(ApiRoute.TOURNAMENT_PLAYOFF, {
      id,
    });
  }

  async function getForOrganization(
    organizationId: number
  ): Promise<HttpResponse<TournamentDto[]>> {
    return await apiService.get<TournamentDto[]>(
      ApiRoute.ORGANIZATION_TOURNAMENTS,
      { id: organizationId }
    );
  }

  async function getById(id: number): Promise<HttpResponse<TournamentDto>> {
    return await apiService.get<TournamentDto>(ApiRoute.TOURNAMENTS_BY_ID, {
      id,
    });
  }

  async function getMatchesForMember(
    dto?: TournamentMatchesGetDto
  ): Promise<HttpResponse<TournamentMatchDto[]>> {
    return await apiService.get<TournamentMatchDto[]>(
      ApiRoute.TOURNAMENTS_MATCHES_MY,
      { ...dto }
    );
  }

  async function remove(id: number): Promise<HttpResponse<null>> {
    return await apiService.delete<null>(ApiRoute.TOURNAMENTS_BY_ID, { id });
  }

  return {
    create,
    setMatchResult,
    seedPlayoff,
    getForOrganization,
    getById,
    getMatchesForMember,
    remove,
  };
}
