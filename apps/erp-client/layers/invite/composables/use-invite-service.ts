import { useState } from 'nuxt/app';
import type { Ref } from 'vue';

import type { InviteCreateDto, InviteDto } from '@shared/dtos';
import { ApiRoute, type HttpResponse } from '@shared/types';

import type { ApiService } from '#layers/api';

export interface InviteService {
  pendingCount: Ref<number>;
  create(
    teamId: number,
    dto: InviteCreateDto
  ): Promise<HttpResponse<InviteDto>>;
  accept(id: number): Promise<HttpResponse<null>>;
  decline(id: number): Promise<HttpResponse<null>>;
  getMyPending(): Promise<HttpResponse<InviteDto[]>>;
  getPendingForTeam(teamId: number): Promise<HttpResponse<InviteDto[]>>;
  revoke(id: number): Promise<HttpResponse<null>>;
}

export function useInviteService(): InviteService {
  const apiService: ApiService = useApiService();

  const pendingCount: Ref<number> = useState<number>(
    'invite:pendingCount',
    (): number => 0
  );

  async function create(
    teamId: number,
    dto: InviteCreateDto
  ): Promise<HttpResponse<InviteDto>> {
    return await apiService.post<InviteDto>(ApiRoute.TEAM_INVITES, {
      id: teamId,
      ...dto,
    });
  }

  async function accept(id: number): Promise<HttpResponse<null>> {
    return await apiService.post<null>(ApiRoute.INVITE_ACCEPT, { id });
  }

  async function decline(id: number): Promise<HttpResponse<null>> {
    return await apiService.post<null>(ApiRoute.INVITE_DECLINE, { id });
  }

  async function getMyPending(): Promise<HttpResponse<InviteDto[]>> {
    const response: HttpResponse<InviteDto[]> = await apiService.get<
      InviteDto[]
    >(ApiRoute.INVITES_MY);

    if (response.isSuccess) {
      pendingCount.value = response.data.length;
    }

    return response;
  }

  async function getPendingForTeam(
    teamId: number
  ): Promise<HttpResponse<InviteDto[]>> {
    return await apiService.get<InviteDto[]>(ApiRoute.TEAM_INVITES, {
      id: teamId,
    });
  }

  async function revoke(id: number): Promise<HttpResponse<null>> {
    return await apiService.delete<null>(ApiRoute.INVITES_BY_ID, { id });
  }

  return {
    pendingCount,
    create,
    accept,
    decline,
    getMyPending,
    getPendingForTeam,
    revoke,
  };
}
