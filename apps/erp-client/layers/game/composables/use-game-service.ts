import { GameType } from '@shared/types';

import { GAME_LABELS } from '../constants';
import type { GameOption } from '../types';

export interface GameService {
  getOptions(): GameOption[];
  getLabel(game: GameType): string;
}

export function useGameService(): GameService {
  function getOptions(): GameOption[] {
    return Object.values(GameType).map(
      (game: GameType): GameOption => ({
        label: GAME_LABELS[game],
        value: game,
      })
    );
  }

  function getLabel(game: GameType): string {
    return GAME_LABELS[game] ?? game;
  }

  return { getOptions, getLabel };
}
