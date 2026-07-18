import type { GameType } from '@erp/types';

import { GAME_LABELS } from '../constants';

export function getGameLabel(type: GameType): string {
  return GAME_LABELS[type] ?? type;
}
