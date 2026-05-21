import { BasicEntity } from '@modules/database/basic/entity.basic';
import { Column, Entity } from 'typeorm';

import { ItemRarity } from '@shared/types';

@Entity('items')
export class ItemEntity extends BasicEntity {
  @Column()
  nameKey: string;

  @Column()
  descriptionKey: string;

  @Column()
  imagePath: string;

  @Column({ type: 'enum', enum: ItemRarity })
  rarity: ItemRarity;
}
