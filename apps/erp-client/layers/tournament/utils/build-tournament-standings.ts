import type {
  TournamentMatchDto,
  TournamentParticipantDto,
} from '@erp/dtos';

export interface TournamentStandingRow {
  participant: TournamentParticipantDto;
  played: number;
  wins: number;
  losses: number;
  scoreFor: number;
  scoreAgainst: number;
  diff: number;
}

export function buildTournamentStandings(
  participants: TournamentParticipantDto[],
  matches: TournamentMatchDto[],
  groupIndex: number
): TournamentStandingRow[] {
  const rows: Map<number, TournamentStandingRow> = new Map();

  for (const participant of participants) {
    if (participant.groupIndex === groupIndex) {
      rows.set(participant.id, {
        participant,
        played: 0,
        wins: 0,
        losses: 0,
        scoreFor: 0,
        scoreAgainst: 0,
        diff: 0,
      });
    }
  }

  for (const match of matches) {
    if (
      match.groupIndex !== groupIndex ||
      match.winnerId === null ||
      match.participantOneId === null ||
      match.participantTwoId === null
    ) {
      continue;
    }

    const one: TournamentStandingRow | undefined = rows.get(
      match.participantOneId
    );
    const two: TournamentStandingRow | undefined = rows.get(
      match.participantTwoId
    );

    if (!one || !two) {
      continue;
    }

    one.played += 1;
    two.played += 1;
    one.scoreFor += match.scoreOne ?? 0;
    one.scoreAgainst += match.scoreTwo ?? 0;
    two.scoreFor += match.scoreTwo ?? 0;
    two.scoreAgainst += match.scoreOne ?? 0;

    if (match.winnerId === one.participant.id) {
      one.wins += 1;
      two.losses += 1;
    } else {
      two.wins += 1;
      one.losses += 1;
    }
  }

  return Array.from(rows.values())
    .map((row: TournamentStandingRow): TournamentStandingRow => {
      row.diff = row.scoreFor - row.scoreAgainst;

      return row;
    })
    .sort(
      (a: TournamentStandingRow, b: TournamentStandingRow): number =>
        b.wins - a.wins || b.diff - a.diff || b.scoreFor - a.scoreFor
    );
}
