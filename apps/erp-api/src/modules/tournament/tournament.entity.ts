import { BasicEntity } from '@modules/database/basic/entity.basic';
import { OrganizationEntity } from '@modules/organization/organization.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { TournamentFormat, TournamentStatus } from '@erp/types';

import { TournamentMatchEntity } from './tournament-match/tournament-match.entity';
import { TournamentParticipantEntity } from './tournament-participant/tournament-participant.entity';
import { TournamentStageEntity } from './tournament-stage/tournament-stage.entity';

@Entity('tournaments')
export class TournamentEntity extends BasicEntity {
  @Column({ type: 'int' })
  organizationId: number;

  @Column({ type: 'varchar', length: 64 })
  name: string;

  @Column({ type: 'enum', enum: TournamentFormat, enumName: 'tournament_format' })
  format: TournamentFormat;

  @Column({
    type: 'enum',
    enum: TournamentStatus,
    enumName: 'tournament_status',
    default: TournamentStatus.DRAFT,
  })
  status: TournamentStatus;

  @Column({ type: 'timestamp' })
  startsAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  endsAt: Date | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string | null;

  @ManyToOne(() => OrganizationEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: OrganizationEntity;

  @OneToMany(
    () => TournamentStageEntity,
    (stage: TournamentStageEntity) => stage.tournament
  )
  stages: TournamentStageEntity[];

  @OneToMany(
    () => TournamentParticipantEntity,
    (participant: TournamentParticipantEntity) => participant.tournament
  )
  participants: TournamentParticipantEntity[];

  @OneToMany(
    () => TournamentMatchEntity,
    (match: TournamentMatchEntity) => match.tournament
  )
  matches: TournamentMatchEntity[];
}
