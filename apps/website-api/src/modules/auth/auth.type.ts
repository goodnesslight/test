export enum AuthType {
  JWT = 'JWT',
  STEAM = 'STEAM',
}

export interface AuthJwtAccountPayload {
  accountId: number;
}

export interface AuthSteamAccountPayload {
  id: string;
  displayName: string;
}
