import { AvatarEntity } from '@modules/avatar/avatar.entity';
import { BasicEntity } from '@modules/database/basic/entity.basic';
import { InventoryEntity } from '@modules/inventory/inventory.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
} from 'typeorm';

@Entity('accounts')
export class AccountEntity extends BasicEntity {
  @Column({ unique: true })
  steamId: string;

  @Column({ default: 1 })
  avatarId: number;

  @Column()
  username: string;

  @OneToOne(() => InventoryEntity, (inventory) => inventory.account, {
    cascade: true,
  })
  inventory: InventoryEntity;

  @ManyToOne(() => AvatarEntity)
  @JoinColumn({ name: 'avatarId' })
  avatar: AvatarEntity;

  @ManyToMany(() => AvatarEntity)
  @JoinTable({
    name: 'account_avatars',
    joinColumn: { name: 'accountId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'avatarId', referencedColumnName: 'id' },
  })
  avatars: AvatarEntity[];
}
