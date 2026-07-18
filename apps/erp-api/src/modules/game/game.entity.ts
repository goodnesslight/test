import { BasicEntity } from '@modules/database/basic/entity.basic';
import { OrganizationEntity } from '@modules/organization/organization.entity';
import { TeamEntity } from '@modules/team/team.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';

import { GameType } from '@erp/types';

@Entity('games')
@Unique(['organizationId', 'type'])
export class GameEntity extends BasicEntity {
  @Column({ type: 'int' })
  organizationId: number;

  @Column({ type: 'enum', enum: GameType, enumName: 'game_type' })
  type: GameType;

  @ManyToOne(
    () => OrganizationEntity,
    (organization: OrganizationEntity) => organization.games,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'organizationId' })
  organization: OrganizationEntity;

  @OneToMany(() => TeamEntity, (team: TeamEntity) => team.game)
  teams: TeamEntity[];
}
