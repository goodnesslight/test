import { Injectable, NotFoundException } from '@nestjs/common';

import { InventoryEntity } from './inventory.entity';
import { InventoryRepository } from './inventory.repository';

@Injectable()
export class InventoryService {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async getByAccountId(accountId: number): Promise<InventoryEntity> {
    const inventory: InventoryEntity | null =
      await this.inventoryRepository.findOneBy({ accountId });

    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

    return inventory;
  }
}
