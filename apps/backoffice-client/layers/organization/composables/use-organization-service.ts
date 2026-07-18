import type {
  OrganizationCreateDto,
  OrganizationDto,
  OrganizationSetActiveDto,
} from '@backoffice/dtos';
import { ApiRoute } from '@backoffice/types';
import { type HttpResponse } from '@shared/types';

import type { ApiService } from '#layers/api';

export interface OrganizationService {
  create(dto: OrganizationCreateDto): Promise<HttpResponse<OrganizationDto>>;
  setActive(
    id: number,
    dto: OrganizationSetActiveDto
  ): Promise<HttpResponse<OrganizationDto>>;
  getAll(): Promise<HttpResponse<OrganizationDto[]>>;
  getById(id: number): Promise<HttpResponse<OrganizationDto>>;
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

  async function getAll(): Promise<HttpResponse<OrganizationDto[]>> {
    return await apiService.get<OrganizationDto[]>(ApiRoute.ORGANIZATIONS);
  }

  async function setActive(
    id: number,
    dto: OrganizationSetActiveDto
  ): Promise<HttpResponse<OrganizationDto>> {
    return await apiService.put<OrganizationDto>(ApiRoute.ORGANIZATIONS_BY_ID, {
      id,
      ...dto,
    });
  }

  async function getById(id: number): Promise<HttpResponse<OrganizationDto>> {
    return await apiService.get<OrganizationDto>(ApiRoute.ORGANIZATIONS_BY_ID, {
      id,
    });
  }

  return {
    create,
    setActive,
    getAll,
    getById,
  };
}
