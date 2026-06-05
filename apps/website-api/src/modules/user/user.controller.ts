import { randomBytes } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

import { ResponseInterceptor } from '@common/interceptors/response.interceptor';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import type { Request } from 'express';
import { diskStorage } from 'multer';

import { UserDto,UserUpdateProfileDto } from '@shared/dtos';

import {
  BadRequestException,
  Body,
  Controller,
  ParseFilePipeBuilder,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import {
  AVATAR_MAX_SIZE_BYTES,
  AVATAR_MIME_EXTENSIONS,
  AVATARS_SUBDIR,
} from './user.const';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';

function resolveAvatarsDir(): string {
  return join(
    process.cwd(),
    process.env.UPLOADS_DIR ?? 'apps/website-api/uploads',
    AVATARS_SUBDIR
  );
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Put('me')
  @UseInterceptors(new ResponseInterceptor(UserDto))
  async updateProfile(
    @CurrentUser() user: UserEntity,
    @Body() dto: UserUpdateProfileDto
  ): Promise<UserEntity> {
    return await this.userService.updateProfile(user, dto);
  }

  @Post('me/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (
          _request: Request,
          _file: Express.Multer.File,
          callback: (error: Error | null, destination: string) => void
        ): void => {
          const directory: string = resolveAvatarsDir();

          mkdirSync(directory, { recursive: true });
          callback(null, directory);
        },
        filename: (
          _request: Request,
          file: Express.Multer.File,
          callback: (error: Error | null, filename: string) => void
        ): void => {
          const extension: string | undefined =
            AVATAR_MIME_EXTENSIONS[file.mimetype];

          if (!extension) {
            callback(
              new BadRequestException('Only PNG, JPEG or WEBP images allowed'),
              ''
            );

            return;
          }

          callback(null, `${randomBytes(16).toString('hex')}.${extension}`);
        },
      }),
      limits: { fileSize: AVATAR_MAX_SIZE_BYTES },
    }),
    new ResponseInterceptor(UserDto)
  )
  async uploadAvatar(
    @CurrentUser() user: UserEntity,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: AVATAR_MAX_SIZE_BYTES })
        .build({ fileIsRequired: true })
    )
    file: Express.Multer.File
  ): Promise<UserEntity> {
    return await this.userService.setAvatar(user, file);
  }
}
