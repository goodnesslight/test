export type AppRouteParams = Record<string, string | number>;

export enum AppRoute {
  HOME = '/',

  LOGIN = '/login',
  REGISTER = '/register',

  INVITES = '/invites',

  ORGANIZATIONS = '/organizations',
  ORGANIZATIONS_BY_ID = '/organizations/:id',

  SETTINGS = '/settings',

  TEAMS_BY_ID = '/teams/:id',
}
