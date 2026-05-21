import { BasicEntity } from '@modules/database/basic/entity.basic';
import { Column, Entity } from 'typeorm';

import { ServerType } from '@shared/types';

@Entity('servers')
export class ServerEntity extends BasicEntity {
  @Column()
  ip: string;

  @Column()
  port: number;

  @Column({ type: 'enum', enum: ServerType })
  type: ServerType;
}
