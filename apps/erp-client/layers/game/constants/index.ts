import { GameType } from '@shared/types';

export const GAME_LABELS: Record<GameType, string> = {
  [GameType.CS2]: 'Counter-Strike 2',
  [GameType.DOTA2]: 'Dota 2',
  [GameType.VALORANT]: 'VALORANT',
  [GameType.LEAGUE_OF_LEGENDS]: 'League of Legends',
};
