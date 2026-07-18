import { OrganizationService } from '@modules/organization/organization.service';
import { UserEntity } from '@modules/user/user.entity';

import { GameCreateDto } from '@erp/dtos';

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { GameEntity } from './game.entity';
import { GameRepository } from './game.repository';

@Injectable()
export class GameService {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly gameRepository: GameRepository
  ) {}

  async create(
    organizationId: number,
    user: UserEntity,
    dto: GameCreateDto
  ): Promise<GameEntity> {
    await this.organizationService.assertCanManage(organizationId, user);

    const existing: GameEntity | null =
      await this.gameRepository.findByOrganizationAndType(
        organizationId,
        dto.type
      );

    if (existing) {
      throw new ConflictException('Game is already added to the organization');
    }

    const game: GameEntity = await this.gameRepository.save(
      this.gameRepository.create({
        organizationId,
        type: dto.type,
      })
    );

    return await this.getById(game.id);
  }

  async getById(id: number): Promise<GameEntity> {
    const game: GameEntity | null =
      await this.gameRepository.findByIdWithRelations(id);

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    return game;
  }

  async getManagedById(id: number, user: UserEntity): Promise<GameEntity> {
    const game: GameEntity = await this.getById(id);

    await this.organizationService.assertCanManage(game.organizationId, user);

    return game;
  }

  async delete(id: number, user: UserEntity): Promise<null> {
    await this.getManagedById(id, user);
    await this.gameRepository.delete(id);

    return null;
  }
}
