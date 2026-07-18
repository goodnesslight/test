import { AdminEntity } from '@modules/admin/admin.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BasicEntity } from '@shared/nest';

import { RequestEntity } from '../request.entity';

@Entity('request_notes')
export class RequestNoteEntity extends BasicEntity {
  @Column({ type: 'int' })
  requestId: number;

  @Column({ type: 'int' })
  adminId: number;

  @Column({ type: 'text' })
  text: string;

  @ManyToOne(() => RequestEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requestId' })
  request: RequestEntity;

  @ManyToOne(() => AdminEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'adminId' })
  admin: AdminEntity;
}
