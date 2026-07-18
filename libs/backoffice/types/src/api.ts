export enum ApiRoute {
  AUTH_LOGIN = 'auth/login',
  AUTH_REFRESH = 'auth/refresh',
  AUTH_LOGOUT = 'auth/logout',

  ADMINS_ME = 'admins/me',

  ORGANIZATIONS = 'organizations',
  ORGANIZATIONS_BY_ID = 'organizations/:id',

  REQUESTS = 'requests',
  REQUESTS_MY = 'requests/my',
  REQUESTS_BY_ID = 'requests/:id',
  REQUEST_NOTES = 'requests/:id/notes',
  REQUEST_RELEASE = 'requests/:id/release',
  REQUEST_TAKE = 'requests/:id/take',
}
