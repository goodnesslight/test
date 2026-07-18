import { Column, Entity } from 'typeorm';

import { InviteStatus, OrganizationRole } from '@backoffice/types';

import { BasicEntity } from '@shared/nest';

// Maps the platform-owned `organization_invites` table (created by erp-api
// migrations in the shared database). The backoffice only writes the subset of
// columns it needs to issue an owner invite; the rest stay NULL.
@Entity('organization_invites')
export class OrganizationInviteEntity extends BasicEntity {
  @Column({ type: 'int' })
  organizationId: number;

  @Column({ type: 'varchar', length: 320 })
  email: string;

  @Column({ type: 'varchar', length: 128, unique: true })
  token: string;

  @Column({
    type: 'enum',
    enum: InviteStatus,
    enumName: 'invite_status',
    default: InviteStatus.PENDING,
  })
  status: InviteStatus;

  @Column({
    type: 'enum',
    enum: OrganizationRole,
    enumName: 'organization_role',
    default: OrganizationRole.MEMBER,
  })
  role: OrganizationRole;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'varchar', length: 64 })
  firstName: string;

  @Column({ type: 'varchar', length: 64 })
  lastName: string;
}
