import { BasicEntity } from '@modules/database/basic/entity.basic';
import { GameEntity } from '@modules/game/game.entity';
import { UserEntity } from '@modules/user/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity('organizations')
export class OrganizationEntity extends BasicEntity {
  @Column({ type: 'varchar', length: 48 })
  name: string;

  @Column({ type: 'varchar', length: 8 })
  tag: string;

  @Column({ type: 'int' })
  ownerId: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner: UserEntity;

  @OneToMany(() => GameEntity, (game: GameEntity) => game.organization)
  games: GameEntity[];

  @Column({ type: 'varchar', nullable: true })
  logoUrl: string | null;
}
