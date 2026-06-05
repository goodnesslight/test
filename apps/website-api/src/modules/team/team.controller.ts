import { ResponseInterceptor } from '@common/interceptors/response.interceptor';
import { CurrentUser } from '@modules/user/user.decorator';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { UserEntity } from '@modules/user/user.entity';

import {
  TeamCreateDto,
  TeamDto,
  TeamUpdateDto,
  TeamUpdateMemberDto,
} from '@shared/dtos';
import { ApiRoute } from '@shared/types';

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

  @Post(ApiRoute.ORGANIZATION_TEAMS)
  @UseInterceptors(new ResponseInterceptor(TeamDto))
  async create(
    @Param('id', ParseIntPipe) organizationId: number,
    @CurrentUser() user: UserEntity,
    @Body() dto: TeamCreateDto
  ): Promise<TeamEntity> {
    return await this.teamService.createInOrganization(
      organizationId,
      user,
      dto
    );
  }

  @Put(ApiRoute.TEAMS_BY_ID)
  @UseInterceptors(new ResponseInterceptor(TeamDto))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
    @Body() dto: TeamUpdateDto
  ): Promise<TeamEntity> {
    return await this.teamService.update(id, user, dto);
  }

  @Put(ApiRoute.TEAM_MEMBERS_BY_ID)
  @UseInterceptors(new ResponseInterceptor(TeamDto))
  async updateMemberRole(
    @Param('id', ParseIntPipe) id: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @CurrentUser() user: UserEntity,
    @Body() dto: TeamUpdateMemberDto
  ): Promise<TeamEntity> {
    return await this.teamService.updateMemberRole(id, memberId, user, dto);
  }

  @Get(ApiRoute.TEAMS_BY_ID)
  @UseInterceptors(new ResponseInterceptor(TeamDto))
  async getById(@Param('id', ParseIntPipe) id: number): Promise<TeamEntity> {
    return await this.teamService.getById(id);
  }

  @Delete(ApiRoute.TEAMS_BY_ID)
  @UseInterceptors(new ResponseInterceptor())
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity
  ): Promise<null> {
    return await this.teamService.delete(id, user);
  }

  @Delete(ApiRoute.TEAM_MEMBERS_BY_ID)
  @UseInterceptors(new ResponseInterceptor(TeamDto))
  async removeMember(
    @Param('id', ParseIntPipe) id: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @CurrentUser() user: UserEntity
  ): Promise<TeamEntity> {
    return await this.teamService.removeMember(id, memberId, user);
  }
}
