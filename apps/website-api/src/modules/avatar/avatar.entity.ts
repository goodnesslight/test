import { BasicEntity } from '@modules/database/basic/entity.basic';
import { Column, Entity } from 'typeorm';

@Entity('avatars')
export class AvatarEntity extends BasicEntity {
  @Column()
  nameKey: string;

  @Column()
  descriptionKey: string;

  @Column()
  imagePath: string;
}
