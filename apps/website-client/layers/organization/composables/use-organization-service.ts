import type {
  CreateOrganizationDto,
  CreateTeamDto,
  OrganizationDto,
  TeamDto,
  UpdateOrganizationDto,
} from '@shared/dtos';
import { ApiRoute, type HttpResponse } from '@shared/types';

import type { ApiService } from '../../api/composables/use-api-service';

export interface OrganizationService {
  getMyOrganizations(): Promise<HttpResponse<OrganizationDto[]>>;
  getById(id: number): Promise<HttpResponse<OrganizationDto>>;
  create(dto: CreateOrganizationDto): Promise<HttpResponse<OrganizationDto>>;
  update(
    id: number,
    dto: UpdateOrganizationDto
  ): Promise<HttpResponse<OrganizationDto>>;
  remove(id: number): Promise<HttpResponse<null>>;
  createTeam(id: number, dto: CreateTeamDto): Promise<HttpResponse<TeamDto>>;
}

export function useOrganizationService(): OrganizationService {
  const apiService: ApiService = useApiService();

  async function getMyOrganizations(): Promise<
    HttpResponse<OrganizationDto[]>
  > {
    return await apiService.get<OrganizationDto[]>(ApiRoute.ORGANIZATIONS_MY);
  }

  async function getById(id: number): Promise<HttpResponse<OrganizationDto>> {
    return await apiService.get<OrganizationDto>(
      ApiRoute.ORGANIZATIONS_BY_ID,
      { id }
    );
  }

  async function create(
    dto: CreateOrganizationDto
  ): Promise<HttpResponse<OrganizationDto>> {
    return await apiService.post<OrganizationDto>(ApiRoute.ORGANIZATIONS, {
      ...dto,
    });
  }

  async function update(
    id: number,
    dto: UpdateOrganizationDto
  ): Promise<HttpResponse<OrganizationDto>> {
    return await apiService.put<OrganizationDto>(
      ApiRoute.ORGANIZATIONS_BY_ID,
      { id, ...dto }
    );
  }

  async function remove(id: number): Promise<HttpResponse<null>> {
    return await apiService.delete<null>(ApiRoute.ORGANIZATIONS_BY_ID, { id });
  }

  async function createTeam(
    id: number,
    dto: CreateTeamDto
  ): Promise<HttpResponse<TeamDto>> {
    return await apiService.post<TeamDto>(ApiRoute.ORGANIZATION_TEAMS, {
      id,
      ...dto,
    });
  }

  return { getMyOrganizations, getById, create, update, remove, createTeam };
}
