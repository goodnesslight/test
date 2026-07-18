import { OrganizationModule } from '@modules/organization/organization.module';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TournamentController } from './tournament.controller';
import { TournamentEntity } from './tournament.entity';
import { TournamentRepository } from './tournament.repository';
import { TournamentService } from './tournament.service';
import { TournamentMatchEntity } from './tournament-match/tournament-match.entity';
import { TournamentMatchRepository } from './tournament-match/tournament-match.repository';
import { TournamentParticipantEntity } from './tournament-participant/tournament-participant.entity';
import { TournamentStageEntity } from './tournament-stage/tournament-stage.entity';

@Module({
  imports: [
    OrganizationModule,
    TypeOrmModule.forFeature([
      TournamentEntity,
      TournamentParticipantEntity,
      TournamentStageEntity,
      TournamentMatchEntity,
    ]),
  ],
  controllers: [TournamentController],
  providers: [TournamentService, TournamentRepository, TournamentMatchRepository],
  exports: [TournamentService],
})
export class TournamentModule {}
