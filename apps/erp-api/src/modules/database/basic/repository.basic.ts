import { DataSource, EntityTarget, Repository } from 'typeorm';

import { BasicEntity } from './entity.basic';

export abstract class BasicRepository<
  T extends BasicEntity
> extends Repository<T> {
  constructor(entityTarget: EntityTarget<T>, dataSource: DataSource) {
    super(entityTarget, dataSource.createEntityManager());
  }
}
