import { randomUUID } from 'node:crypto';

import { ConfigKey } from '@common/types/config.type';
import axios from 'axios';

import { UploadResultDto } from '@erp/dtos';

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  private readonly logger: Logger = new Logger(UploadService.name);
  private readonly MAX_SIZE_BYTES: number = 5 * 1024 * 1024;
  private readonly EXTENSIONS: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };

  constructor(private readonly configService: ConfigService) {}

  async uploadImage(file: Express.Multer.File): Promise<UploadResultDto> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const extension: string | undefined = this.EXTENSIONS[file.mimetype];

    if (!extension) {
      throw new BadRequestException(
        'Only PNG, JPEG, WebP or GIF images are allowed'
      );
    }

    if (file.size > this.MAX_SIZE_BYTES) {
      throw new BadRequestException('The image is too large (max 5 MB)');
    }

    const path: string = `uploads/${randomUUID()}.${extension}`;
    const host: string = this.configService.getOrThrow(
      ConfigKey.BUNNY_STORAGE_HOST
    );
    const zone: string = this.configService.getOrThrow(
      ConfigKey.BUNNY_STORAGE_ZONE
    );
    const key: string = this.configService.getOrThrow(
      ConfigKey.BUNNY_STORAGE_KEY
    );
    const cdnUrl: string = this.configService.getOrThrow(
      ConfigKey.BUNNY_CDN_URL
    );

    if (!zone || !key || !cdnUrl) {
      this.logger.error(
        'BunnyCDN is not configured — set BUNNY_STORAGE_ZONE, BUNNY_STORAGE_KEY and BUNNY_CDN_URL'
      );

      throw new InternalServerErrorException('Image storage is not configured');
    }

    try {
      await axios.put(`https://${host}/${zone}/${path}`, file.buffer, {
        headers: { AccessKey: key, 'Content-Type': file.mimetype },
        maxBodyLength: Infinity,
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        this.logger.error(
          `BunnyCDN upload failed (${error.response?.status}): ${JSON.stringify(
            error.response?.data
          )}`
        );
      } else {
        this.logger.error('BunnyCDN upload failed', error as Error);
      }

      throw new InternalServerErrorException(
        'Failed to upload the image to the CDN'
      );
    }

    return { url: `${cdnUrl.replace(/\/+$/, '')}/${path}` };
  }
}
