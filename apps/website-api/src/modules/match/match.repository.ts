import { BasicRepository } from '@modules/database/basic/repository.basic';
import { DataSource } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { MatchEntity } from './match.entity';

@Injectable()
export class MatchRepository extends BasicRepository<MatchEntity> {
  constructor(dataSource: DataSource) {
    super(MatchEntity, dataSource);
  }
}
