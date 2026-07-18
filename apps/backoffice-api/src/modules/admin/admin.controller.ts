import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

import { AdminDto } from '@backoffice/dtos';
import { ApiRoute } from '@backoffice/types';
import { ResponseInterceptor } from '@shared/nest';

import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';

import { AdminEntity } from './admin.entity';
import { CurrentAdmin } from './admin.decorator';

@Controller()
export class AdminController {
  @Get(ApiRoute.ADMINS_ME)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new ResponseInterceptor(AdminDto))
  async getMe(@CurrentAdmin() admin: AdminEntity): Promise<AdminEntity> {
    return admin;
  }
}
