import { BasicEntity } from '@modules/database/basic/entity.basic';
import { TeamEntity } from '@modules/team/team.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { TournamentEntity } from '../tournament.entity';

@Entity('tournament_participants')
export class TournamentParticipantEntity extends BasicEntity {
  @Column({ type: 'int' })
  tournamentId: number;

  @Column({ type: 'varchar', length: 64 })
  name: string;

  @Column({ type: 'int', nullable: true })
  seed: number | null;

  @Column({ type: 'int', nullable: true })
  groupIndex: number | null;

  @Column({ type: 'int', nullable: true })
  teamId: number | null;

  @Column({ type: 'varchar', nullable: true })
  logoUrl: string | null;

  @ManyToOne(
    () => TournamentEntity,
    (tournament: TournamentEntity) => tournament.participants,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'tournamentId' })
  tournament: TournamentEntity;

  @ManyToOne(() => TeamEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'teamId' })
  team: TeamEntity | null;
}
