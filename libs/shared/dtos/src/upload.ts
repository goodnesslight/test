import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UploadResultDto {
  @Expose()
  url: string;
}
