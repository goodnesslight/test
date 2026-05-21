import { ServerOnlineResponseDto, ServerResponseDto } from '@shared/dtos';
import { ApiRoute, HttpResponse, ServerType } from '@shared/types';

export interface ServerService {
  fetchOnline: () => Promise<ServerOnlineResponseDto | null>;
  fetchList: (type?: ServerType) => Promise<ServerResponseDto[]>;
}

export function useServerService(): ServerService {
  const apiService: ApiService = useApiService();

  async function fetchOnline(): Promise<ServerOnlineResponseDto | null> {
    const response: HttpResponse<ServerOnlineResponseDto> =
      await apiService.get(ApiRoute.SERVER_ONLINE);
    return response.isSuccess ? response.data : null;
  }

  async function fetchList(type?: ServerType): Promise<ServerResponseDto[]> {
    const response: HttpResponse<ServerResponseDto[]> = await apiService.get(
      ApiRoute.SERVER_LIST,
      { type }
    );
    return response.isSuccess ? response.data : [];
  }

  return {
    fetchOnline,
    fetchList,
  };
}
