import type { RequestDto, RequestUpdateDto } from '@backoffice/dtos';
import { ApiRoute } from '@backoffice/types';
import { type HttpResponse } from '@shared/types';

import type { ApiService } from '#layers/api';

export interface RequestService {
  update(id: number, dto: RequestUpdateDto): Promise<HttpResponse<RequestDto>>;
  getAll(): Promise<HttpResponse<RequestDto[]>>;
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

  async function getAll(): Promise<HttpResponse<RequestDto[]>> {
    return await apiService.get<RequestDto[]>(ApiRoute.REQUESTS);
  }

  async function remove(id: number): Promise<HttpResponse<null>> {
    return await apiService.delete<null>(ApiRoute.REQUESTS_BY_ID, { id });
  }

  return {
    update,
    getAll,
    remove,
  };
}
