import { BasicEntity } from '@modules/database/basic/entity.basic';
import { UserEntity } from '@modules/user/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';

import { OrganizationRole } from '@erp/types';

import { OrganizationEntity } from '../organization.entity';

@Entity('organization_members')
@Unique(['organizationId', 'userId'])
export class OrganizationMemberEntity extends BasicEntity {
  @Column({ type: 'int' })
  organizationId: number;

  @Column({ type: 'int' })
  userId: number;

  @Column({
    type: 'enum',
    enum: OrganizationRole,
    enumName: 'organization_role',
    default: OrganizationRole.ADMIN,
  })
  role: OrganizationRole;

  @ManyToOne(
    () => OrganizationEntity,
    (organization: OrganizationEntity) => organization.members,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'organizationId' })
  organization: OrganizationEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
}
