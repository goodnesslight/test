import { BasicEntity } from '@modules/database/basic/entity.basic';
import { Column, Entity, Generated } from 'typeorm';

import { Locale } from '@shared/types';

@Entity('users')
export class UserEntity extends BasicEntity {
  @Column({ type: 'varchar', length: 32, unique: true })
  username: string;

  @Column({
    type: 'enum',
    enum: Locale,
    enumName: 'locale_type',
    default: Locale.RU,
  })
  locale: Locale;

  @Column({ type: 'uuid', unique: true })
  @Generated('uuid')
  calendarToken: string;

  @Column({ type: 'varchar', length: 320, unique: true, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', nullable: true })
  passwordHash: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  firstName: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  lastName: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  country: string | null;

  @Column({ type: 'date', nullable: true })
  birthDate: string | null;

  @Column({ type: 'varchar', nullable: true })
  avatarUrl: string | null;

  @Column({ type: 'varchar', length: 64, unique: true, nullable: true })
  googleId: string | null;
}
