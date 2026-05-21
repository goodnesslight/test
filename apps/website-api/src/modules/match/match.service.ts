import { Injectable } from '@nestjs/common';

import { MatchEntity } from './match.entity';
import { MatchRepository } from './match.repository';

@Injectable()
export class MatchService {
  constructor(private readonly matchRepository: MatchRepository) {}

  async getList(): Promise<MatchEntity[]> {
    return this.matchRepository.find();
  }
}
