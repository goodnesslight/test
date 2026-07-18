import { BasicEntity } from '@modules/database/basic/entity.basic';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { TournamentEntity } from '../tournament.entity';
import { TournamentParticipantEntity } from '../tournament-participant/tournament-participant.entity';
import { TournamentStageEntity } from '../tournament-stage/tournament-stage.entity';

@Entity('tournament_matches')
export class TournamentMatchEntity extends BasicEntity {
  @Column({ type: 'int' })
  tournamentId: number;

  @Column({ type: 'int' })
  stageId: number;

  @Column({ type: 'int', nullable: true })
  groupIndex: number | null;

  @Column({ type: 'int', nullable: true })
  round: number | null;

  @Column({ type: 'int', nullable: true })
  slot: number | null;

  @Column({ type: 'int', nullable: true })
  participantOneId: number | null;

  @Column({ type: 'int', nullable: true })
  participantTwoId: number | null;

  @Column({ type: 'int', nullable: true })
  winnerId: number | null;

  @Column({ type: 'int', nullable: true })
  scoreOne: number | null;

  @Column({ type: 'int', nullable: true })
  scoreTwo: number | null;

  @Column({ type: 'timestamp', nullable: true })
  startsAt: Date | null;

  @Column({ type: 'int', nullable: true })
  nextMatchId: number | null;

  @Column({ type: 'smallint', nullable: true })
  nextSlot: number | null;

  @ManyToOne(
    () => TournamentEntity,
    (tournament: TournamentEntity) => tournament.matches,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'tournamentId' })
  tournament: TournamentEntity;

  @ManyToOne(() => TournamentStageEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stageId' })
  stage: TournamentStageEntity;

  @ManyToOne(() => TournamentParticipantEntity, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'participantOneId' })
  participantOne: TournamentParticipantEntity | null;

  @ManyToOne(() => TournamentParticipantEntity, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'participantTwoId' })
  participantTwo: TournamentParticipantEntity | null;

  @ManyToOne(() => TournamentMatchEntity, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'nextMatchId' })
  nextMatch: TournamentMatchEntity | null;
}
