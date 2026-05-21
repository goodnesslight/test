import { ServerType } from '@shared/types';

export enum GameDigProviderType {
  COUNTER_STRIKE_2 = 'counterstrike2',
}

export interface GameDigStateResponse {
  map: string;
  maxplayers: number;
  numplayers: number;
}

export interface ServerCache {
  map: string;
  ip: string;
  port: number;
  maxPlayers: number;
  currentPlayers: number;
  type: ServerType;
}
