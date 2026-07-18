import type { GameType } from '@erp/types';

import { GAME_ICONS } from '../constants';

export function getGameIcon(type: GameType): string {
  return GAME_ICONS[type] ?? 'pi pi-desktop';
}
