import type { UploadResultDto } from '@erp/dtos';
import { HttpHeader, type HttpSuccessResponse } from '@shared/types';
import { ApiRoute } from '@erp/types';

import { ConfigKey, type ConfigService } from '#layers/config';

export interface UploadService {
  uploadImage(file: File): Promise<string | null>;
}

export function useUploadService(): UploadService {
  const configService: ConfigService = useConfigService();

  const apiUrl: string = configService.getOrThrow(ConfigKey.API_URL);

  async function uploadImage(file: File): Promise<string | null> {
    const slug: string | null = getOrganizationSlug();
    const formData: FormData = new FormData();
    formData.append('file', file);

    try {
      const response: HttpSuccessResponse<UploadResultDto> = await $fetch(
        `${apiUrl}/${ApiRoute.UPLOADS_IMAGE}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: slug ? { [HttpHeader.ORGANIZATION_SLUG]: slug } : undefined,
          body: formData,
        }
      );

      return response.data.url;
    } catch {
      return null;
    }
  }

  return { uploadImage };
}
