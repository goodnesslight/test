import { BasicEntity } from '@modules/database/basic/entity.basic';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { TournamentStageType } from '@erp/types';

import { TournamentEntity } from '../tournament.entity';

@Entity('tournament_stages')
export class TournamentStageEntity extends BasicEntity {
  @Column({ type: 'int' })
  tournamentId: number;

  @Column({
    type: 'enum',
    enum: TournamentStageType,
    enumName: 'tournament_stage_type',
  })
  type: TournamentStageType;

  @Column({ type: 'int' })
  order: number;

  @Column({ type: 'varchar', length: 48 })
  name: string;

  @Column({ type: 'int', nullable: true })
  groupCount: number | null;

  @Column({ type: 'int', nullable: true })
  advanceCount: number | null;

  @ManyToOne(
    () => TournamentEntity,
    (tournament: TournamentEntity) => tournament.stages,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'tournamentId' })
  tournament: TournamentEntity;
}
