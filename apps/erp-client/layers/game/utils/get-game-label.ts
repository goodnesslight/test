import type { GameType } from '@shared/types';

import { GAME_LABELS } from '../constants';

export function getGameLabel(type: GameType): string {
  return GAME_LABELS[type] ?? type;
}
