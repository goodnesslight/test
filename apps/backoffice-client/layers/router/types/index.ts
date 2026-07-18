export type AppRouteParams = Record<string, string | number>;

export enum AppRoute {
  HOME = '/',

  LOGIN = '/login',

  REQUESTS = '/requests',
  REQUESTS_MY = '/requests/my',
  REQUESTS_BY_ID = '/requests/:id',
}
