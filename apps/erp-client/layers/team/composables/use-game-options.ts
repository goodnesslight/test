import { GameType } from '@shared/types';

export interface GameOption {
  label: string;
  value: GameType;
}

const GAME_LABELS: Record<GameType, string> = {
  [GameType.CS2]: 'Counter-Strike 2',
  [GameType.DOTA2]: 'Dota 2',
  [GameType.VALORANT]: 'VALORANT',
  [GameType.LEAGUE_OF_LEGENDS]: 'League of Legends',
};

export function useGameOptions(): GameOption[] {
  return Object.values(GameType).map(
    (game: GameType): GameOption => ({
      label: GAME_LABELS[game],
      value: game,
    })
  );
}

export function getGameLabel(game: GameType): string {
  return GAME_LABELS[game] ?? game;
}
