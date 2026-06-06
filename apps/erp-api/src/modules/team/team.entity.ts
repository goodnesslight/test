import { BasicEntity } from '@modules/database/basic/entity.basic';
import { GameEntity } from '@modules/game/game.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';

import { TeamType } from '@shared/types';

import { TeamMemberEntity } from './team-member/team-member.entity';

@Entity('teams')
@Unique(['gameId', 'type'])
export class TeamEntity extends BasicEntity {
  @Column({ type: 'int' })
  gameId: number;

  @Column({ type: 'enum', enum: TeamType, enumName: 'team_type' })
  type: TeamType;

  @ManyToOne(() => GameEntity, (game: GameEntity) => game.teams, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'gameId' })
  game: GameEntity;

  @OneToMany(() => TeamMemberEntity, (member: TeamMemberEntity) => member.team)
  members: TeamMemberEntity[];
}
