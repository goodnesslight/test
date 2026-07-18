import { TournamentFormat, TournamentStatus } from '@erp/types';

type TournamentStatusSeverity = 'secondary' | 'warn' | 'success';

export const TOURNAMENT_FORMAT_LABELS: Record<TournamentFormat, string> = {
  [TournamentFormat.SINGLE_ELIMINATION]: 'tournaments.formats.single_elimination',
  [TournamentFormat.ROUND_ROBIN]: 'tournaments.formats.round_robin',
  [TournamentFormat.GROUPS_PLAYOFF]: 'tournaments.formats.groups_playoff',
};

export const TOURNAMENT_STATUS_LABELS: Record<TournamentStatus, string> = {
  [TournamentStatus.DRAFT]: 'tournaments.statuses.draft',
  [TournamentStatus.ONGOING]: 'tournaments.statuses.ongoing',
  [TournamentStatus.COMPLETED]: 'tournaments.statuses.completed',
};

export const TOURNAMENT_STATUS_SEVERITIES: Record<
  TournamentStatus,
  TournamentStatusSeverity
> = {
  [TournamentStatus.DRAFT]: 'secondary',
  [TournamentStatus.ONGOING]: 'warn',
  [TournamentStatus.COMPLETED]: 'success',
};
