import type {
  RequestDto,
  RequestNoteCreateDto,
  RequestNoteDto,
  RequestUpdateDto,
} from '@backoffice/dtos';
import { ApiRoute } from '@backoffice/types';
import { type HttpResponse } from '@shared/types';

import type { ApiService } from '#layers/api';

export interface RequestService {
  update(id: number, dto: RequestUpdateDto): Promise<HttpResponse<RequestDto>>;
  takeIntoWork(id: number): Promise<HttpResponse<RequestDto>>;
  release(id: number): Promise<HttpResponse<RequestDto>>;
  createNote(
    id: number,
    dto: RequestNoteCreateDto
  ): Promise<HttpResponse<RequestNoteDto>>;
  getIncoming(): Promise<HttpResponse<RequestDto[]>>;
  getMine(): Promise<HttpResponse<RequestDto[]>>;
  getById(id: number): Promise<HttpResponse<RequestDto>>;
  getNotes(id: number): Promise<HttpResponse<RequestNoteDto[]>>;
  remove(id: number): Promise<HttpResponse<null>>;
}

export function useRequestService(): RequestService {
  const apiService: ApiService = useApiService();

  async function update(
    id: number,
    dto: RequestUpdateDto
  ): Promise<HttpResponse<RequestDto>> {
    return await apiService.put<RequestDto>(ApiRoute.REQUESTS_BY_ID, {
      id,
      ...dto,
    });
  }

  async function takeIntoWork(id: number): Promise<HttpResponse<RequestDto>> {
    return await apiService.post<RequestDto>(ApiRoute.REQUEST_TAKE, { id });
  }

  async function release(id: number): Promise<HttpResponse<RequestDto>> {
    return await apiService.post<RequestDto>(ApiRoute.REQUEST_RELEASE, { id });
  }

  async function createNote(
    id: number,
    dto: RequestNoteCreateDto
  ): Promise<HttpResponse<RequestNoteDto>> {
    return await apiService.post<RequestNoteDto>(ApiRoute.REQUEST_NOTES, {
      id,
      ...dto,
    });
  }

  async function getIncoming(): Promise<HttpResponse<RequestDto[]>> {
    return await apiService.get<RequestDto[]>(ApiRoute.REQUESTS);
  }

  async function getMine(): Promise<HttpResponse<RequestDto[]>> {
    return await apiService.get<RequestDto[]>(ApiRoute.REQUESTS_MY);
  }

  async function getById(id: number): Promise<HttpResponse<RequestDto>> {
    return await apiService.get<RequestDto>(ApiRoute.REQUESTS_BY_ID, { id });
  }

  async function getNotes(id: number): Promise<HttpResponse<RequestNoteDto[]>> {
    return await apiService.get<RequestNoteDto[]>(ApiRoute.REQUEST_NOTES, {
      id,
    });
  }

  async function remove(id: number): Promise<HttpResponse<null>> {
    return await apiService.delete<null>(ApiRoute.REQUESTS_BY_ID, { id });
  }

  return {
    update,
    takeIntoWork,
    release,
    createNote,
    getIncoming,
    getMine,
    getById,
    getNotes,
    remove,
  };
}
