import { AccountEntity } from '@modules/account/account.entity';
import { BasicEntity } from '@modules/database/basic/entity.basic';
import { ItemEntity } from '@modules/item/item.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToOne,
} from 'typeorm';

@Entity('inventories')
export class InventoryEntity extends BasicEntity {
  @Column()
  accountId: number;

  @OneToOne(() => AccountEntity)
  @JoinColumn({ name: 'accountId' })
  account: AccountEntity;

  @ManyToMany(() => ItemEntity)
  @JoinTable({
    name: 'inventory_items',
    joinColumn: { name: 'inventoryId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'itemId', referencedColumnName: 'id' },
  })
  items: ItemEntity[];
}
