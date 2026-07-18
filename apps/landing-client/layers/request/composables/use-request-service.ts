import type { RequestCreateDto, RequestDto } from '@backoffice/dtos';
import { ApiRoute } from '@backoffice/types';
import { type HttpResponse } from '@shared/types';

import type { ApiService } from '#layers/api';

export interface RequestService {
  submit(dto: RequestCreateDto): Promise<HttpResponse<RequestDto>>;
}

export function useRequestService(): RequestService {
  const apiService: ApiService = useApiService();

  async function submit(
    dto: RequestCreateDto
  ): Promise<HttpResponse<RequestDto>> {
    return await apiService.post<RequestDto>(ApiRoute.REQUESTS, { ...dto });
  }

  return { submit };
}
