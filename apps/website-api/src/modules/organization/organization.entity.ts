import { BasicEntity } from '@modules/database/basic/entity.basic';
import { TeamEntity } from '@modules/team/team.entity';
import { UserEntity } from '@modules/user/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity('organizations')
export class OrganizationEntity extends BasicEntity {
  @Column({ type: 'varchar', length: 48 })
  name: string;

  @Column({ type: 'varchar', length: 8 })
  tag: string;

  @Column({ type: 'varchar', nullable: true })
  logoUrl: string | null;

  @Column({ type: 'int' })
  ownerId: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner: UserEntity;

  @OneToMany(
    () => TeamEntity,
    (team: TeamEntity) => team.organization
  )
  teams: TeamEntity[];
}
