import { Exclude, Expose } from 'class-transformer';

import { Locale } from '@shared/types';

@Exclude()
export class UserDto {
  @Expose()
  id: number;

  @Expose()
  email: string | null;

  @Expose()
  username: string;

  @Expose()
  firstName: string | null;

  @Expose()
  lastName: string | null;

  @Expose()
  locale: Locale;

  @Expose()
  avatarUrl: string | null;

  @Expose()
  googleId: string | null;

  @Expose()
  createdAt: Date;
}
