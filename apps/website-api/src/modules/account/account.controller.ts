import { ResponseInterceptor } from '@common/interceptors/response.interceptor';
import { JwtGuard } from '@modules/auth/guards/jwt.guard';

import { AccountOneDto, AccountResponseDto } from '@shared/dtos';
import { ApiRoute } from '@shared/types';

import {
  Controller,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { AccountService } from './account.service';

@ApiBearerAuth()
@ApiTags('account')
@Controller()
@UseGuards(JwtGuard)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get(ApiRoute.ACCOUNT_BY_ID)
  @UseInterceptors(new ResponseInterceptor(AccountResponseDto))
  async getById(@Param() dto: AccountOneDto): Promise<AccountResponseDto> {
    return await this.accountService.getById(dto.id);
  }
}
