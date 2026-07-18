import { Column, Entity } from 'typeorm';

import { BasicEntity } from '@shared/nest';

@Entity('admins')
export class AdminEntity extends BasicEntity {
  @Column({ type: 'varchar', length: 320, unique: true })
  email: string;

  @Column({ type: 'varchar' })
  passwordHash: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  firstName: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  lastName: string | null;

  @Column({ type: 'varchar', nullable: true })
  refreshTokenHash: string | null;
}
