export interface JwtPayload {
  sub: number;
  username: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRecord {
  hash: string;
}
