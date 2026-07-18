import { Column, Entity } from 'typeorm';

import { RequestStatus } from '@backoffice/types';

import { BasicEntity } from '@shared/nest';

@Entity('requests')
export class RequestEntity extends BasicEntity {
  @Column({ type: 'varchar', length: 64 })
  name: string;

  @Column({ type: 'varchar', length: 320 })
  email: string;

  @Column({ type: 'varchar', length: 48 })
  organizationName: string;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    enumName: 'request_status',
    default: RequestStatus.PENDING,
  })
  status: RequestStatus;

  @Column({ type: 'text', nullable: true })
  message: string | null;
}
