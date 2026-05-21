import { BasicRepository } from '@modules/database/basic/repository.basic';
import { DataSource } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { AccountEntity } from './account.entity';

@Injectable()
export class AccountRepository extends BasicRepository<AccountEntity> {
  constructor(dataSource: DataSource) {
    super(AccountEntity, dataSource);
  }
}
