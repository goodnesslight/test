import { BasicEntity } from '@modules/database/basic/entity.basic';
import { TeamEntity } from '@modules/team/team.entity';
import { UserEntity } from '@modules/user/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { InviteStatus, TeamMemberRole } from '@shared/types';

@Entity('team_invites')
export class InviteEntity extends BasicEntity {
  @Column({ type: 'int' })
  teamId: number;

  @Column({ type: 'int' })
  invitedUserId: number;

  @Column({
    type: 'enum',
    enum: InviteStatus,
    enumName: 'invite_status',
    default: InviteStatus.PENDING,
  })
  status: InviteStatus;

  @Column({
    type: 'enum',
    enum: TeamMemberRole,
    enumName: 'team_member_role',
    default: TeamMemberRole.PLAYER,
  })
  role: TeamMemberRole;

  @ManyToOne(() => TeamEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teamId' })
  team: TeamEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invitedUserId' })
  invitedUser: UserEntity;
}
