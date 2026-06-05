import { BasicEntity } from '@modules/database/basic/entity.basic';
import { TeamEntity } from '@modules/team/team.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { EventType } from '@shared/types';

import { EventAttendanceEntity } from './event-attendance/event-attendance.entity';

@Entity('events')
export class EventEntity extends BasicEntity {
  @Column({ type: 'int' })
  teamId: number;

  @Column({ type: 'enum', enum: EventType, enumName: 'event_type' })
  type: EventType;

  @Column({ type: 'varchar', length: 64 })
  title: string;

  @Column({ type: 'timestamp' })
  startsAt: Date;

  @ManyToOne(() => TeamEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teamId' })
  team: TeamEntity;

  @OneToMany(
    () => EventAttendanceEntity,
    (attendance: EventAttendanceEntity) => attendance.event
  )
  attendances: EventAttendanceEntity[];

  @Column({ type: 'varchar', length: 64, nullable: true })
  opponent: string | null;

  @Column({ type: 'timestamp', nullable: true })
  endsAt: Date | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string | null;
}
