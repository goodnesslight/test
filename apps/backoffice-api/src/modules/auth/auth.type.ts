export interface JwtPayload {
  sub: number;
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
