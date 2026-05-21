import { BasicRepository } from '@modules/database/basic/repository.basic';
import { DataSource } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { AvatarEntity } from './avatar.entity';

@Injectable()
export class AvatarRepository extends BasicRepository<AvatarEntity> {
  constructor(dataSource: DataSource) {
    super(AvatarEntity, dataSource);
  }
}
