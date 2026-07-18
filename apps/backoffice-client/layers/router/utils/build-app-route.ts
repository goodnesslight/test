import type { AppRoute, AppRouteParams } from '../types';

export function buildAppRoute(route: AppRoute, params: AppRouteParams): string {
  let path: string = String(route);

  for (const [key, value] of Object.entries(params)) {
    path = path.replace(`:${key}`, String(value));
  }

  return path;
}
