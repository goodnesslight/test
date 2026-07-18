import { BasicRepository } from '@modules/database/basic/repository.basic';
import { DataSource } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { UserEntity } from './user.entity';

@Injectable()
export class UserRepository extends BasicRepository<UserEntity> {
  constructor(dataSource: DataSource) {
    super(UserEntity, dataSource);
  }

  async findById(id: number): Promise<UserEntity | null> {
    return await this.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return await this.findOne({ where: { email } });
  }

  async findByGoogleId(googleId: string): Promise<UserEntity | null> {
    return await this.findOne({ where: { googleId } });
  }

  async findByCalendarToken(calendarToken: string): Promise<UserEntity | null> {
    return await this.findOne({ where: { calendarToken } });
  }
}
