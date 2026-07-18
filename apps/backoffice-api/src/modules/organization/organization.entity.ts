import { Column, Entity } from 'typeorm';

import { BasicEntity } from '@shared/nest';

@Entity('organizations')
export class OrganizationEntity extends BasicEntity {
  @Column({ type: 'varchar', length: 48 })
  name: string;

  @Column({ type: 'varchar', length: 8 })
  tag: string;

  @Column({ type: 'varchar', length: 48, unique: true })
  slug: string;

  @Column({ type: 'varchar', nullable: true })
  logoUrl: string | null;
}
