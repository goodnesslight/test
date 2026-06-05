import { BasicEntity } from '@modules/database/basic/entity.basic';
import { UserEntity } from '@modules/user/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';

import { EventAttendanceStatus } from '@shared/types';

import { EventEntity } from './event.entity';

@Entity('event_attendances')
@Unique(['eventId', 'userId'])
export class EventAttendanceEntity extends BasicEntity {
  @Column({ type: 'int' })
  eventId: number;

  @Column({ type: 'int' })
  userId: number;

  @Column({
    type: 'enum',
    enum: EventAttendanceStatus,
    enumName: 'attendance_status',
  })
  status: EventAttendanceStatus;

  @ManyToOne(
    () => EventEntity,
    (event: EventEntity) => event.attendances,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'eventId' })
  event: EventEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
}
