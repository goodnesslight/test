import type {
  TeamDto,
  TeamUpdateDto,
  TeamUpdateMemberDto,
} from '@shared/dtos';
import { ApiRoute, type HttpResponse } from '@shared/types';

import type { ApiService } from '../../api/composables/use-api-service';

export interface TeamService {
  getById(id: number): Promise<HttpResponse<TeamDto>>;
  update(id: number, dto: TeamUpdateDto): Promise<HttpResponse<TeamDto>>;
  remove(id: number): Promise<HttpResponse<null>>;
  updateMemberRole(
    teamId: number,
    memberId: number,
    dto: TeamUpdateMemberDto
  ): Promise<HttpResponse<TeamDto>>;
  removeMember(
    teamId: number,
    memberId: number
  ): Promise<HttpResponse<TeamDto>>;
}

export function useTeamService(): TeamService {
  const apiService: ApiService = useApiService();

  async function getById(id: number): Promise<HttpResponse<TeamDto>> {
    return await apiService.get<TeamDto>(ApiRoute.TEAMS_BY_ID, { id });
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

  async function remove(id: number): Promise<HttpResponse<null>> {
    return await apiService.delete<null>(ApiRoute.TEAMS_BY_ID, { id });
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

  async function removeMember(
    teamId: number,
    memberId: number
  ): Promise<HttpResponse<TeamDto>> {
    return await apiService.delete<TeamDto>(ApiRoute.TEAM_MEMBERS_BY_ID, {
      id: teamId,
      memberId,
    });
  }

  return { getById, update, remove, updateMemberRole, removeMember };
}
