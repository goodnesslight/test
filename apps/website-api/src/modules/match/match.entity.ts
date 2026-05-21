import { BasicEntity } from '@modules/database/basic/entity.basic';
import { ServerEntity } from '@modules/server/server.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

@Entity('matches')
export class MatchEntity extends BasicEntity {
  @Column()
  serverId: number;

  @ManyToOne(() => ServerEntity)
  @JoinColumn({ name: 'serverId' })
  server: ServerEntity;

  @CreateDateColumn()
  finishedAt: Date;
}
