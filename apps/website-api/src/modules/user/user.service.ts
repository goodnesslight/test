import { existsSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

import { ConfigKey } from '@common/types/config.type';

import { UpdateProfileDto } from '@shared/dtos';
import { EnvironmentType } from '@shared/types';

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AVATARS_SUBDIR } from './user.const';
import { UserEntity } from './user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  private readonly logger: Logger = new Logger(UserService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService
  ) {}

  async updateProfile(
    user: UserEntity,
    dto: UpdateProfileDto
  ): Promise<UserEntity> {
    await this.userRepository.update(user.id, {
      firstName:
        dto.firstName === undefined
          ? user.firstName
          : dto.firstName.trim() || null,
      lastName:
        dto.lastName === undefined
          ? user.lastName
          : dto.lastName.trim() || null,
      locale: dto.locale ?? user.locale,
    });

    return (await this.userRepository.findById(user.id)) as UserEntity;
  }

  async setAvatar(
    user: UserEntity,
    file: Express.Multer.File
  ): Promise<UserEntity> {
    this.deleteLocalAvatar(user.avatarUrl);

    const avatarUrl: string = `${this.getOrigin()}/uploads/${AVATARS_SUBDIR}/${file.filename}`;

    await this.userRepository.update(user.id, { avatarUrl });

    return (await this.userRepository.findById(user.id)) as UserEntity;
  }

  private deleteLocalAvatar(avatarUrl: string | null): void {
    const marker: string = `/uploads/${AVATARS_SUBDIR}/`;

    if (!avatarUrl || !avatarUrl.includes(marker)) {
      return;
    }

    const filename: string = avatarUrl.split(marker)[1] ?? '';
    const filePath: string = join(
      process.cwd(),
      this.configService.getOrThrow(ConfigKey.UPLOADS_DIR),
      AVATARS_SUBDIR,
      filename
    );

    try {
      if (filename && existsSync(filePath)) {
        unlinkSync(filePath);
      }
    } catch (error: unknown) {
      this.logger.warn(`Failed to delete old avatar ${filePath}`, error);
    }
  }

  private getOrigin(): string {
    const host: string = this.configService.getOrThrow(ConfigKey.HOST);
    const port: number = this.configService.getOrThrow(ConfigKey.PORT);
    const isDevelopment: boolean =
      this.configService.getOrThrow(ConfigKey.NODE_ENV) ===
      EnvironmentType.DEVELOPMENT;

    return isDevelopment ? `http://${host}:${port}` : `https://${host}`;
  }
}
