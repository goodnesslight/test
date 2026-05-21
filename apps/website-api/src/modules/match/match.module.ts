import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MatchController } from './match.controller';
import { MatchEntity } from './match.entity';
import { MatchRepository } from './match.repository';
import { MatchService } from './match.service';

@Module({
  imports: [TypeOrmModule.forFeature([MatchEntity])],
  controllers: [MatchController],
  providers: [MatchService, MatchRepository],
})
export class MatchModule {}
