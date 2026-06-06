export enum ApiRoute {
  AUTH_REGISTER = 'auth/register',
  AUTH_LOGIN = 'auth/login',
  AUTH_REFRESH = 'auth/refresh',
  AUTH_LOGOUT = 'auth/logout',
  AUTH_GOOGLE = 'auth/google',
  AUTH_GOOGLE_CALLBACK = 'auth/google/callback',

  EVENTS_FEED = 'events/feed',
  EVENTS_MY = 'events/my',
  EVENTS_BY_ID = 'events/:id',
  EVENT_ATTENDANCE = 'events/:id/attendance',

  GAMES_BY_ID = 'games/:id',
  GAME_TEAMS = 'games/:id/teams',

  INVITES_MY = 'invites/my',
  INVITES_BY_ID = 'invites/:id',
  INVITE_ACCEPT = 'invites/:id/accept',
  INVITE_DECLINE = 'invites/:id/decline',

  ORGANIZATIONS = 'organizations',
  ORGANIZATIONS_MY = 'organizations/my',
  ORGANIZATIONS_BY_ID = 'organizations/:id',
  ORGANIZATION_GAMES = 'organizations/:id/games',

  TEAMS_BY_ID = 'teams/:id',
  TEAM_EVENTS = 'teams/:id/events',
  TEAM_INVITES = 'teams/:id/invites',
  TEAM_MEMBERS_BY_ID = 'teams/:id/members/:memberId',

  USERS_ME = 'users/me',
  USER_CALENDAR_TOKEN = 'users/me/calendar-token',
}
