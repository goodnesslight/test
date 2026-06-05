import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class OrganizationLiteDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  tag: string;

  @Expose()
  logoUrl: string | null;

  @Expose()
  ownerId: number;
}
