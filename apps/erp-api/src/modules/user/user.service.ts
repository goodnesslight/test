import { randomUUID } from 'crypto';

import { UserUpdateProfileDto } from '@shared/dtos';

import { Injectable } from '@nestjs/common';

import { UserEntity } from './user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async updateProfile(
    user: UserEntity,
    dto: UserUpdateProfileDto
  ): Promise<UserEntity> {
    await this.userRepository.update(user.id, {
      firstName:
        dto.firstName === undefined
          ? user.firstName
          : dto.firstName.trim() || null,
      lastName:
        dto.lastName === undefined
          ? user.lastName
          : dto.lastName.trim() || null,
      locale: dto.locale ?? user.locale,
    });

    return (await this.userRepository.findById(user.id)) as UserEntity;
  }

  async regenerateCalendarToken(user: UserEntity): Promise<UserEntity> {
    await this.userRepository.update(user.id, {
      calendarToken: randomUUID(),
    });

    return (await this.userRepository.findById(user.id)) as UserEntity;
  }
}
