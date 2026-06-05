import type {
  CreateEventDto,
  EventDto,
  SetAttendanceDto,
  UpdateEventDto,
} from '@shared/dtos';
import { ApiRoute, type HttpResponse } from '@shared/types';

import type { ApiService } from '../../api/composables/use-api-service';

export interface EventService {
  getForTeam(
    teamId: number,
    from?: string,
    to?: string
  ): Promise<HttpResponse<EventDto[]>>;
  create(teamId: number, dto: CreateEventDto): Promise<HttpResponse<EventDto>>;
  update(id: number, dto: UpdateEventDto): Promise<HttpResponse<EventDto>>;
  remove(id: number): Promise<HttpResponse<null>>;
  setAttendance(
    id: number,
    dto: SetAttendanceDto
  ): Promise<HttpResponse<EventDto>>;
}

export function useEventService(): EventService {
  const apiService: ApiService = useApiService();

  async function getForTeam(
    teamId: number,
    from?: string,
    to?: string
  ): Promise<HttpResponse<EventDto[]>> {
    return await apiService.get<EventDto[]>(ApiRoute.TEAM_EVENTS, {
      id: teamId,
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
    });
  }

  async function create(
    teamId: number,
    dto: CreateEventDto
  ): Promise<HttpResponse<EventDto>> {
    return await apiService.post<EventDto>(ApiRoute.TEAM_EVENTS, {
      id: teamId,
      ...dto,
    });
  }

  async function update(
    id: number,
    dto: UpdateEventDto
  ): Promise<HttpResponse<EventDto>> {
    return await apiService.put<EventDto>(ApiRoute.EVENTS_BY_ID, {
      id,
      ...dto,
    });
  }

  async function remove(id: number): Promise<HttpResponse<null>> {
    return await apiService.delete<null>(ApiRoute.EVENTS_BY_ID, { id });
  }

  async function setAttendance(
    id: number,
    dto: SetAttendanceDto
  ): Promise<HttpResponse<EventDto>> {
    return await apiService.post<EventDto>(ApiRoute.EVENT_ATTENDANCE, {
      id,
      ...dto,
    });
  }

  return { getForTeam, create, update, remove, setAttendance };
}
