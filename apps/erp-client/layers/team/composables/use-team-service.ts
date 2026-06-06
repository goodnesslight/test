import type {
  TeamCreateDto,
  TeamDto,
  TeamUpdateDto,
  TeamUpdateMemberDto,
} from '@shared/dtos';
import { ApiRoute, type HttpResponse } from '@shared/types';

import type { ApiService } from '#layers/api';

export interface TeamService {
  create(
    organizationId: number,
    dto: TeamCreateDto
  ): Promise<HttpResponse<TeamDto>>;
  update(id: number, dto: TeamUpdateDto): Promise<HttpResponse<TeamDto>>;
  updateMemberRole(
    teamId: number,
    memberId: number,
    dto: TeamUpdateMemberDto
  ): Promise<HttpResponse<TeamDto>>;
  getById(id: number): Promise<HttpResponse<TeamDto>>;
  remove(id: number): Promise<HttpResponse<null>>;
  removeMember(
    teamId: number,
    memberId: number
  ): Promise<HttpResponse<TeamDto>>;
}

export function useTeamService(): TeamService {
  const apiService: ApiService = useApiService();

  async function create(
    organizationId: number,
    dto: TeamCreateDto
  ): Promise<HttpResponse<TeamDto>> {
    return await apiService.post<TeamDto>(ApiRoute.ORGANIZATION_TEAMS, {
      id: organizationId,
      ...dto,
    });
  }

  async function update(
    id: number,
    dto: TeamUpdateDto
  ): Promise<HttpResponse<TeamDto>> {
    return await apiService.put<TeamDto>(ApiRoute.TEAMS_BY_ID, {
      id,
      ...dto,
    });
  }

  async function updateMemberRole(
    teamId: number,
    memberId: number,
    dto: TeamUpdateMemberDto
  ): Promise<HttpResponse<TeamDto>> {
    return await apiService.put<TeamDto>(ApiRoute.TEAM_MEMBERS_BY_ID, {
      id: teamId,
      memberId,
      ...dto,
    });
  }

  async function getById(id: number): Promise<HttpResponse<TeamDto>> {
    return await apiService.get<TeamDto>(ApiRoute.TEAMS_BY_ID, { id });
  }

  async function remove(id: number): Promise<HttpResponse<null>> {
    return await apiService.delete<null>(ApiRoute.TEAMS_BY_ID, { id });
  }

  async function removeMember(
    teamId: number,
    memberId: number
  ): Promise<HttpResponse<TeamDto>> {
    return await apiService.delete<TeamDto>(ApiRoute.TEAM_MEMBERS_BY_ID, {
      id: teamId,
      memberId,
    });
  }

  return { create, update, updateMemberRole, getById, remove, removeMember };
}
