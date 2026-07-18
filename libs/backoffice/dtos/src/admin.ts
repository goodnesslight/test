import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class AdminDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  createdAt: Date;

  @Expose()
  firstName: string | null;

  @Expose()
  lastName: string | null;
}
