import type {
  OrganizationAddAdminDto,
  OrganizationCreateDto,
  OrganizationDto,
  OrganizationUpdateDto,
} from '@shared/dtos';
import { ApiRoute, type HttpResponse } from '@shared/types';

import type { ApiService } from '#layers/api';

export interface OrganizationService {
  create(dto: OrganizationCreateDto): Promise<HttpResponse<OrganizationDto>>;
  update(
    id: number,
    dto: OrganizationUpdateDto
  ): Promise<HttpResponse<OrganizationDto>>;
  addAdmin(
    id: number,
    dto: OrganizationAddAdminDto
  ): Promise<HttpResponse<OrganizationDto>>;
  getMy(): Promise<HttpResponse<OrganizationDto[]>>;
  getById(id: number): Promise<HttpResponse<OrganizationDto>>;
  remove(id: number): Promise<HttpResponse<null>>;
  removeAdmin(
    id: number,
    memberId: number
  ): Promise<HttpResponse<OrganizationDto>>;
}

export function useOrganizationService(): OrganizationService {
  const apiService: ApiService = useApiService();

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
    return await apiService.put<OrganizationDto>(
      ApiRoute.ORGANIZATIONS_BY_ID,
      { id, ...dto }
    );
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

  async function getMy(): Promise<HttpResponse<OrganizationDto[]>> {
    return await apiService.get<OrganizationDto[]>(ApiRoute.ORGANIZATIONS_MY);
  }

  async function getById(id: number): Promise<HttpResponse<OrganizationDto>> {
    return await apiService.get<OrganizationDto>(
      ApiRoute.ORGANIZATIONS_BY_ID,
      { id }
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

  return {
    create,
    update,
    addAdmin,
    getMy,
    getById,
    remove,
    removeAdmin,
  };
}
