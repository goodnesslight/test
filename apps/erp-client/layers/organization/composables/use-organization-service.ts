import type {
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
  getMy(): Promise<HttpResponse<OrganizationDto[]>>;
  getById(id: number): Promise<HttpResponse<OrganizationDto>>;
  remove(id: number): Promise<HttpResponse<null>>;
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

  return { create, update, getMy, getById, remove };
}
