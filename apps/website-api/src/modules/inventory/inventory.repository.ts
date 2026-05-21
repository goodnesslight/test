import { BasicRepository } from '@modules/database/basic/repository.basic';
import { DataSource } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { InventoryEntity } from './inventory.entity';

@Injectable()
export class InventoryRepository extends BasicRepository<InventoryEntity> {
  constructor(dataSource: DataSource) {
    super(InventoryEntity, dataSource);
  }
}
