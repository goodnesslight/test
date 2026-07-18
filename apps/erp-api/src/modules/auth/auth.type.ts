export interface JwtPayload {
  sub: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRecord {
  hash: string;
}
