import { UserEntity } from '@modules/user/user.entity';

export interface JwtPayload {
  sub: number;
  username: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: UserEntity;
  tokens: AuthTokens;
}

export interface RefreshTokenRecord {
  hash: string;
}

export interface GoogleProfile {
  googleId: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
}
