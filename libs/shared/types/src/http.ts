export enum HttpMethod {
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  GET = 'GET',
}

export enum HttpHeader {
  ORGANIZATION_SLUG = 'x-organization-slug',
}

export type HttpResponse<T> = HttpSuccessResponse<T> | HttpErrorResponse;

export interface HttpSuccessResponse<T> {
  error: null;
  isSuccess: true;
  data: T;
  timestamp: string;
}

export interface HttpErrorResponse {
  error: string;
  isSuccess: false;
  data: null;
  timestamp: string;
}
