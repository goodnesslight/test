import { BasicEntity } from '@modules/database/basic/entity.basic';
import { UserEntity } from '@modules/user/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';

import { TeamMemberRole } from '@shared/types';

import { TeamEntity } from './team.entity';

@Entity('team_members')
@Unique(['teamId', 'userId'])
export class TeamMemberEntity extends BasicEntity {
  @Column({ type: 'int' })
  teamId: number;

  @Column({ type: 'int' })
  userId: number;

  @Column({
    type: 'enum',
    enum: TeamMemberRole,
    enumName: 'team_member_role',
    default: TeamMemberRole.PLAYER,
  })
  role: TeamMemberRole;

  @ManyToOne(
    () => TeamEntity,
    (team: TeamEntity) => team.members,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'teamId' })
  team: TeamEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
}
