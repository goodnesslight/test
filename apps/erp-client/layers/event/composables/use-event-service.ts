import type {
  EventCreateDto,
  EventDto,
  EventGetListDto,
  EventSetAttendanceDto,
  EventUpdateDto,
} from '@shared/dtos';
import { ApiRoute, type HttpResponse } from '@shared/types';

import type { ApiService } from '#layers/api';

export interface EventService {
  create(teamId: number, dto: EventCreateDto): Promise<HttpResponse<EventDto>>;
  update(id: number, dto: EventUpdateDto): Promise<HttpResponse<EventDto>>;
  setAttendance(
    id: number,
    dto: EventSetAttendanceDto
  ): Promise<HttpResponse<EventDto>>;
  getForTeam(
    teamId: number,
    dto?: EventGetListDto
  ): Promise<HttpResponse<EventDto[]>>;
  remove(id: number): Promise<HttpResponse<null>>;
}

export function useEventService(): EventService {
  const apiService: ApiService = useApiService();

  async function create(
    teamId: number,
    dto: EventCreateDto
  ): Promise<HttpResponse<EventDto>> {
    return await apiService.post<EventDto>(ApiRoute.TEAM_EVENTS, {
      id: teamId,
      ...dto,
    });
  }

  async function update(
    id: number,
    dto: EventUpdateDto
  ): Promise<HttpResponse<EventDto>> {
    return await apiService.put<EventDto>(ApiRoute.EVENTS_BY_ID, {
      id,
      ...dto,
    });
  }

  async function setAttendance(
    id: number,
    dto: EventSetAttendanceDto
  ): Promise<HttpResponse<EventDto>> {
    return await apiService.post<EventDto>(ApiRoute.EVENT_ATTENDANCE, {
      id,
      ...dto,
    });
  }

  async function getForTeam(
    teamId: number,
    dto?: EventGetListDto
  ): Promise<HttpResponse<EventDto[]>> {
    return await apiService.get<EventDto[]>(ApiRoute.TEAM_EVENTS, {
      id: teamId,
      ...dto,
    });
  }

  async function remove(id: number): Promise<HttpResponse<null>> {
    return await apiService.delete<null>(ApiRoute.EVENTS_BY_ID, { id });
  }

  return { create, update, setAttendance, getForTeam, remove };
}
