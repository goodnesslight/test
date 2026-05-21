import { Injectable } from '@nestjs/common';

import { AvatarEntity } from './avatar.entity';
import { AvatarRepository } from './avatar.repository';

@Injectable()
export class AvatarService {
  constructor(private readonly avatarRepository: AvatarRepository) {}

  async getList(): Promise<AvatarEntity[]> {
    return await this.avatarRepository.find();
  }
}
