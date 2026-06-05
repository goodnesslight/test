export enum ApiRoute {
  AUTH_REGISTER = 'auth/register',
  AUTH_LOGIN = 'auth/login',
  AUTH_REFRESH = 'auth/refresh',
  AUTH_LOGOUT = 'auth/logout',
  AUTH_ME = 'auth/me',
  AUTH_GOOGLE = 'auth/google',
  AUTH_GOOGLE_RETURN = 'auth/google/return',

  USERS_ME = 'users/me',

  ORGANIZATIONS = 'organizations',
  ORGANIZATIONS_MY = 'organizations/my',
  ORGANIZATIONS_BY_ID = 'organizations/:id',
  ORGANIZATION_TEAMS = 'organizations/:id/teams',

  TEAMS_BY_ID = 'teams/:id',
  TEAM_MEMBERS_BY_ID = 'teams/:id/members/:memberId',
  TEAM_INVITES = 'teams/:id/invites',
  TEAM_EVENTS = 'teams/:id/events',

  INVITES_MY = 'invites/my',
  INVITES_BY_ID = 'invites/:id',
  INVITE_ACCEPT = 'invites/:id/accept',
  INVITE_DECLINE = 'invites/:id/decline',

  EVENTS_BY_ID = 'events/:id',
  EVENT_ATTENDANCE = 'events/:id/attendance',
}
