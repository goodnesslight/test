import { ResponseInterceptor } from '@common/interceptors/response.interceptor';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { UserEntity } from '@modules/user/user.entity';

import {
  TeamCreateDto,
  TeamDto,
  TeamUpdateDto,
  TeamUpdateMemberDto,
} from '@shared/dtos';

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { TeamEntity } from './team.entity';
import { TeamService } from './team.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post('organizations/:organizationId/teams')
  @UseInterceptors(new ResponseInterceptor(TeamDto))
  async create(
    @CurrentUser() user: UserEntity,
    @Param('organizationId', ParseIntPipe) organizationId: number,
    @Body() dto: TeamCreateDto
  ): Promise<TeamEntity> {
    return await this.teamService.createInOrganization(
      organizationId,
      user.id,
      dto
    );
  }

  @Get('teams/:id')
  @UseInterceptors(new ResponseInterceptor(TeamDto))
  async getById(@Param('id', ParseIntPipe) id: number): Promise<TeamEntity> {
    return await this.teamService.getById(id);
  }

  @Put('teams/:id')
  @UseInterceptors(new ResponseInterceptor(TeamDto))
  async update(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: TeamUpdateDto
  ): Promise<TeamEntity> {
    return await this.teamService.update(id, user.id, dto);
  }

  @Delete('teams/:id')
  @UseInterceptors(new ResponseInterceptor())
  async delete(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseIntPipe) id: number
  ): Promise<null> {
    await this.teamService.delete(id, user.id);

    return null;
  }

  @Put('teams/:id/members/:memberId')
  @UseInterceptors(new ResponseInterceptor(TeamDto))
  async updateMemberRole(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseIntPipe) id: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() dto: TeamUpdateMemberDto
  ): Promise<TeamEntity> {
    return await this.teamService.updateMemberRole(
      id,
      memberId,
      user.id,
      dto
    );
  }

  @Delete('teams/:id/members/:memberId')
  @UseInterceptors(new ResponseInterceptor(TeamDto))
  async removeMember(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseIntPipe) id: number,
    @Param('memberId', ParseIntPipe) memberId: number
  ): Promise<TeamEntity> {
    return await this.teamService.removeMember(id, memberId, user.id);
  }
}
