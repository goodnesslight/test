import { BasicEntity } from '@modules/database/basic/entity.basic';
import { UserEntity } from '@modules/user/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { InviteStatus, OrganizationRole } from '@erp/types';

import { OrganizationEntity } from '../organization.entity';

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

  @Column({ type: 'varchar', length: 64, nullable: true })
  country: string | null;

  @Column({ type: 'date', nullable: true })
  birthDate: string | null;

  @Column({ type: 'varchar', nullable: true })
  avatarUrl: string | null;

  @Column({ type: 'int', nullable: true })
  invitedUserId: number | null;

  @ManyToOne(() => OrganizationEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: OrganizationEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'invitedUserId' })
  invitedUser: UserEntity | null;
}
