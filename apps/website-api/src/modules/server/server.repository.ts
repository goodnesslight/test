import { BasicRepository } from '@modules/database/basic/repository.basic';
import { DataSource } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { ServerEntity } from './server.entity';

@Injectable()
export class ServerRepository extends BasicRepository<ServerEntity> {
  constructor(dataSource: DataSource) {
    super(ServerEntity, dataSource);
  }
}
