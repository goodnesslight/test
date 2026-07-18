import { ResponseInterceptor } from '@common/interceptors/response.interceptor';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

import { UploadResultDto } from '@erp/dtos';
import { ApiRoute } from '@erp/types';

import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { UploadService } from './upload.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post(ApiRoute.UPLOADS_IMAGE)
  @UseInterceptors(
    FileInterceptor('file'),
    new ResponseInterceptor(UploadResultDto)
  )
  async uploadImage(
    @UploadedFile() file: Express.Multer.File
  ): Promise<UploadResultDto> {
    return await this.uploadService.uploadImage(file);
  }
}
