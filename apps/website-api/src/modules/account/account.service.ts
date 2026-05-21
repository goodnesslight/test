import { InventoryEntity } from '@modules/inventory/inventory.entity';

import { AccountCreateDto } from '@shared/dtos';

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { AccountEntity } from './account.entity';
import { AccountRepository } from './account.repository';

@Injectable()
export class AccountService {
  constructor(private readonly accountRepository: AccountRepository) {}

  async create(dto: AccountCreateDto): Promise<AccountEntity> {
    const account: AccountEntity | null = await this.getBySteamId(dto.steamId);

    if (account) {
      throw new ConflictException('Account already exists');
    }

    return this.accountRepository.save({
      steamId: dto.steamId,
      username: dto.username,
      inventory: new InventoryEntity(),
    });
  }

  async getById(id: number): Promise<AccountEntity> {
    const account: AccountEntity | null = await this.accountRepository.findOne({
      where: { id },
      relations: ['inventory', 'inventory.items', 'avatar'],
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }

  async getBySteamId(steamId: string): Promise<AccountEntity | null> {
    return this.accountRepository.findOneBy({ steamId });
  }
}
