export enum ApiRoute {
  AUTH_LOGIN = 'auth/login',
  AUTH_REFRESH = 'auth/refresh',
  AUTH_LOGOUT = 'auth/logout',

  ADMINS_ME = 'admins/me',

  ORGANIZATIONS = 'organizations',
  ORGANIZATIONS_BY_ID = 'organizations/:id',

  REQUESTS = 'requests',
  REQUESTS_BY_ID = 'requests/:id',
}
