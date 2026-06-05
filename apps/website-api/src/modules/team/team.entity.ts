import { BasicEntity } from '@modules/database/basic/entity.basic';
import { OrganizationEntity } from '@modules/organization/organization.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { GameType } from '@shared/types';

import { TeamMemberEntity } from './team-member.entity';

@Entity('teams')
export class TeamEntity extends BasicEntity {
  @Column({ type: 'int' })
  organizationId: number;

  @Column({ type: 'varchar', length: 48 })
  name: string;

  @Column({ type: 'enum', enum: GameType, enumName: 'game_type' })
  game: GameType;

  @ManyToOne(
    () => OrganizationEntity,
    (organization: OrganizationEntity) => organization.teams,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'organizationId' })
  organization: OrganizationEntity;

  @OneToMany(
    () => TeamMemberEntity,
    (member: TeamMemberEntity) => member.team
  )
  members: TeamMemberEntity[];
}
