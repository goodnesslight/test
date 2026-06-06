import { GameType } from '@shared/types';

export const GAME_ICONS: Record<GameType, string> = {
  [GameType.CS2]: 'pi pi-bullseye',
  [GameType.DOTA2]: 'pi pi-shield',
  [GameType.VALORANT]: 'pi pi-bolt',
  [GameType.LEAGUE_OF_LEGENDS]: 'pi pi-crown',
};

export const GAME_LABELS: Record<GameType, string> = {
  [GameType.CS2]: 'Counter-Strike 2',
  [GameType.DOTA2]: 'Dota 2',
  [GameType.VALORANT]: 'VALORANT',
  [GameType.LEAGUE_OF_LEGENDS]: 'League of Legends',
};
