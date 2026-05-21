import {
  type ApiRoute,
  HttpMethod,
  type HttpResponse,
  type HttpSuccessResponse,
} from '@shared/types';

import { ConfigKey } from '../../config/types';

export interface ApiService {
  post<T>(
    route: ApiRoute,
    dto?: Record<string, unknown>
  ): Promise<HttpResponse<T>>;
  put<T>(
    route: ApiRoute,
    dto?: Record<string, unknown>
  ): Promise<HttpResponse<T>>;
  delete<T>(
    route: ApiRoute,
    dto?: Record<string, unknown>
  ): Promise<HttpResponse<T>>;
  get<T>(
    route: ApiRoute,
    dto?: Record<string, unknown>
  ): Promise<HttpResponse<T>>;
}

export function useApiService(): ApiService {
  const configService: ConfigService = useConfigService();

  const apiUrl: string = configService.getOrThrow(ConfigKey.API_URL);

  function post<T>(
    route: ApiRoute,
    dto?: Record<string, unknown>
  ): Promise<HttpResponse<T>> {
    return request<T>(route, HttpMethod.POST, dto);
  }

  function put<T>(
    route: ApiRoute,
    dto?: Record<string, unknown>
  ): Promise<HttpResponse<T>> {
    return request<T>(route, HttpMethod.PUT, dto);
  }

  function del<T>(
    route: ApiRoute,
    dto?: Record<string, unknown>
  ): Promise<HttpResponse<T>> {
    return request<T>(route, HttpMethod.DELETE, dto);
  }

  function get<T>(
    route: ApiRoute,
    dto?: Record<string, unknown>
  ): Promise<HttpResponse<T>> {
    return request<T>(route, HttpMethod.GET, dto);
  }

  async function request<T>(
    route: ApiRoute,
    method: HttpMethod,
    dto?: Record<string, unknown>
  ): Promise<HttpResponse<T>> {
    try {
      const params: Record<string, unknown> = dto ? { ...dto } : {};
      let path: string = String(route);

      for (const [key, value] of Object.entries(params)) {
        if (path.includes(`:${key}`)) {
          path = path.replace(`:${key}`, String(value));
          delete params[key];
        }
      }

      let url: string = `${apiUrl}/${path}`;

      if (method === HttpMethod.GET && Object.keys(params).length > 0) {
        const query: string = new URLSearchParams(
          Object.entries(params).map(([key, value]) => [key, String(value)])
        ).toString();
        url += `?${query}`;
      }

      return await $fetch<HttpSuccessResponse<T>>(url, {
        method,
        credentials: 'include',
        body: method !== HttpMethod.GET ? dto : undefined,
      });
    } catch {
      return {
        error: 'Request failed',
        isSuccess: false,
        data: null,
        timestamp: new Date().toISOString(),
      };
    }
  }

  return { post, put, delete: del, get };
}
