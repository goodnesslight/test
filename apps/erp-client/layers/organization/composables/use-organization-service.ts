import { useState } from 'nuxt/app';
import type { Ref } from 'vue';

import type {
  OrganizationAddAdminDto,
  OrganizationCreateDto,
  OrganizationDto,
  OrganizationInviteCreateDto,
  OrganizationInviteDto,
  OrganizationLiteDto,
  OrganizationUpdateDto,
} from '@erp/dtos';
import { type HttpResponse } from '@shared/types';
import { ApiRoute } from '@erp/types';

import type { ApiService } from '#layers/api';

export interface OrganizationService {
  current: Ref<OrganizationDto | null>;
  publicInfo: Ref<OrganizationLiteDto | null>;
  create(dto: OrganizationCreateDto): Promise<HttpResponse<OrganizationDto>>;
  update(
    id: number,
    dto: OrganizationUpdateDto
  ): Promise<HttpResponse<OrganizationDto>>;
  addAdmin(
    id: number,
    dto: OrganizationAddAdminDto
  ): Promise<HttpResponse<OrganizationDto>>;
  invite(
    id: number,
    dto: OrganizationInviteCreateDto
  ): Promise<HttpResponse<OrganizationInviteDto>>;
  acceptInvite(token: string): Promise<HttpResponse<OrganizationInviteDto>>;
  fetchCurrent(): Promise<OrganizationDto | null>;
  fetchPublic(): Promise<OrganizationLiteDto | null>;
  getMy(): Promise<HttpResponse<OrganizationDto[]>>;
  getById(id: number): Promise<HttpResponse<OrganizationDto>>;
  getInvites(id: number): Promise<HttpResponse<OrganizationInviteDto[]>>;
  getInviteByToken(token: string): Promise<HttpResponse<OrganizationInviteDto>>;
  remove(id: number): Promise<HttpResponse<null>>;
  removeAdmin(
    id: number,
    memberId: number
  ): Promise<HttpResponse<OrganizationDto>>;
  revokeInvite(id: number, inviteId: number): Promise<HttpResponse<null>>;
}

export function useOrganizationService(): OrganizationService {
  const apiService: ApiService = useApiService();

  const current: Ref<OrganizationDto | null> = useState<OrganizationDto | null>(
    'organization:current',
    (): OrganizationDto | null => null
  );
  const publicInfo: Ref<OrganizationLiteDto | null> =
    useState<OrganizationLiteDto | null>(
      'organization:public',
      (): OrganizationLiteDto | null => null
    );

  async function create(
    dto: OrganizationCreateDto
  ): Promise<HttpResponse<OrganizationDto>> {
    return await apiService.post<OrganizationDto>(ApiRoute.ORGANIZATIONS, {
      ...dto,
    });
  }

  async function update(
    id: number,
    dto: OrganizationUpdateDto
  ): Promise<HttpResponse<OrganizationDto>> {
    return await apiService.put<OrganizationDto>(ApiRoute.ORGANIZATIONS_BY_ID, {
      id,
      ...dto,
    });
  }

  async function addAdmin(
    id: number,
    dto: OrganizationAddAdminDto
  ): Promise<HttpResponse<OrganizationDto>> {
    return await apiService.post<OrganizationDto>(
      ApiRoute.ORGANIZATION_ADMINS,
      { id, ...dto }
    );
  }

  async function invite(
    id: number,
    dto: OrganizationInviteCreateDto
  ): Promise<HttpResponse<OrganizationInviteDto>> {
    return await apiService.post<OrganizationInviteDto>(
      ApiRoute.ORGANIZATION_INVITES,
      { id, ...dto }
    );
  }

  async function acceptInvite(
    token: string
  ): Promise<HttpResponse<OrganizationInviteDto>> {
    return await apiService.post<OrganizationInviteDto>(
      ApiRoute.ORGANIZATIONS_INVITES_ACCEPT,
      { token }
    );
  }

  async function fetchCurrent(): Promise<OrganizationDto | null> {
    const response: HttpResponse<OrganizationDto> =
      await apiService.get<OrganizationDto>(ApiRoute.ORGANIZATIONS_CURRENT);

    current.value = response.isSuccess ? response.data : null;

    return current.value;
  }

  async function fetchPublic(): Promise<OrganizationLiteDto | null> {
    const response: HttpResponse<OrganizationLiteDto> =
      await apiService.get<OrganizationLiteDto>(ApiRoute.ORGANIZATIONS_PUBLIC);

    publicInfo.value = response.isSuccess ? response.data : null;

    return publicInfo.value;
  }

  async function getMy(): Promise<HttpResponse<OrganizationDto[]>> {
    return await apiService.get<OrganizationDto[]>(ApiRoute.ORGANIZATIONS_MY);
  }

  async function getById(id: number): Promise<HttpResponse<OrganizationDto>> {
    return await apiService.get<OrganizationDto>(ApiRoute.ORGANIZATIONS_BY_ID, {
      id,
    });
  }

  async function getInvites(
    id: number
  ): Promise<HttpResponse<OrganizationInviteDto[]>> {
    return await apiService.get<OrganizationInviteDto[]>(
      ApiRoute.ORGANIZATION_INVITES,
      { id }
    );
  }

  async function getInviteByToken(
    token: string
  ): Promise<HttpResponse<OrganizationInviteDto>> {
    return await apiService.get<OrganizationInviteDto>(
      ApiRoute.ORGANIZATIONS_INVITES_BY_TOKEN,
      { token }
    );
  }

  async function remove(id: number): Promise<HttpResponse<null>> {
    return await apiService.delete<null>(ApiRoute.ORGANIZATIONS_BY_ID, { id });
  }

  async function removeAdmin(
    id: number,
    memberId: number
  ): Promise<HttpResponse<OrganizationDto>> {
    return await apiService.delete<OrganizationDto>(
      ApiRoute.ORGANIZATION_ADMINS_BY_ID,
      { id, memberId }
    );
  }

  async function revokeInvite(
    id: number,
    inviteId: number
  ): Promise<HttpResponse<null>> {
    return await apiService.delete<null>(ApiRoute.ORGANIZATION_INVITES_BY_ID, {
      id,
      inviteId,
    });
  }

  return {
    current,
    publicInfo,
    create,
    update,
    addAdmin,
    invite,
    acceptInvite,
    fetchCurrent,
    fetchPublic,
    getMy,
    getById,
    getInvites,
    getInviteByToken,
    remove,
    removeAdmin,
    revokeInvite,
  };
}
