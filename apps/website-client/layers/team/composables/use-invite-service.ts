import { useState } from 'nuxt/app';
import type { Ref } from 'vue';

import type { CreateInviteDto, InviteDto } from '@shared/dtos';
import { ApiRoute, type HttpResponse } from '@shared/types';

import type { ApiService } from '../../api/composables/use-api-service';

export interface InviteService {
  pendingCount: Ref<number>;
  refreshPendingCount(): Promise<void>;
  getMyInvites(): Promise<HttpResponse<InviteDto[]>>;
  getTeamInvites(teamId: number): Promise<HttpResponse<InviteDto[]>>;
  create(
    teamId: number,
    dto: CreateInviteDto
  ): Promise<HttpResponse<InviteDto>>;
  accept(id: number): Promise<HttpResponse<null>>;
  decline(id: number): Promise<HttpResponse<null>>;
  revoke(id: number): Promise<HttpResponse<null>>;
}

export function useInviteService(): InviteService {
  const apiService: ApiService = useApiService();

  const pendingCount: Ref<number> = useState<number>(
    'invites:pending-count',
    (): number => 0
  );

  async function refreshPendingCount(): Promise<void> {
    const response: HttpResponse<InviteDto[]> = await getMyInvites();

    if (response.isSuccess) {
      pendingCount.value = response.data.length;
    }
  }

  async function getMyInvites(): Promise<HttpResponse<InviteDto[]>> {
    return await apiService.get<InviteDto[]>(ApiRoute.INVITES_MY);
  }

  async function getTeamInvites(
    teamId: number
  ): Promise<HttpResponse<InviteDto[]>> {
    return await apiService.get<InviteDto[]>(ApiRoute.TEAM_INVITES, {
      id: teamId,
    });
  }

  async function create(
    teamId: number,
    dto: CreateInviteDto
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

  async function revoke(id: number): Promise<HttpResponse<null>> {
    return await apiService.delete<null>(ApiRoute.INVITES_BY_ID, { id });
  }

  return {
    pendingCount,
    refreshPendingCount,
    getMyInvites,
    getTeamInvites,
    create,
    accept,
    decline,
    revoke,
  };
}
