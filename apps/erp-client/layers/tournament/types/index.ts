import type { TournamentFormat } from '@erp/types';

export interface TournamentFormatOption {
  label: string;
  value: TournamentFormat;
}

export interface TournamentParticipantInput {
  name: string;
  seed: number;
  teamId: number | null;
}
