export type AppRouteParams = Record<string, string | number>;

export enum AppRoute {
  HOME = '/',

  LOGIN = '/login',
  INVITE_BY_TOKEN = '/invite/:token',

  CALENDAR = '/calendar',

  INVITES = '/invites',

  SETTINGS = '/settings',

  TEAMS_BY_ID = '/teams/:id',

  USERS_BY_ID = '/users/:id',
}
