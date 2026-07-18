import { MigrationInterface, QueryRunner } from 'typeorm';

export class TournamentCreate1781740800000 implements MigrationInterface {
  name: string = 'TournamentCreate1781740800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "tournament_format" AS ENUM ('single_elimination', 'round_robin', 'groups_playoff')`
    );
    await queryRunner.query(
      `CREATE TYPE "tournament_status" AS ENUM ('draft', 'ongoing', 'completed')`
    );
    await queryRunner.query(
      `CREATE TYPE "tournament_stage_type" AS ENUM ('group', 'bracket')`
    );

    await queryRunner.query(
      `CREATE TABLE "tournaments" (
        "id" SERIAL NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "organizationId" integer NOT NULL,
        "name" character varying(64) NOT NULL,
        "format" "tournament_format" NOT NULL,
        "status" "tournament_status" NOT NULL DEFAULT 'draft',
        "startsAt" TIMESTAMP NOT NULL,
        "endsAt" TIMESTAMP,
        "description" character varying(500),
        CONSTRAINT "PK_tournaments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_tournaments_organization" FOREIGN KEY ("organizationId")
          REFERENCES "organizations"("id") ON DELETE CASCADE
      )`
    );

    await queryRunner.query(
      `CREATE TABLE "tournament_participants" (
        "id" SERIAL NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "tournamentId" integer NOT NULL,
        "name" character varying(64) NOT NULL,
        "seed" integer,
        "groupIndex" integer,
        "teamId" integer,
        "logoUrl" character varying,
        CONSTRAINT "PK_tournament_participants" PRIMARY KEY ("id"),
        CONSTRAINT "FK_tournament_participants_tournament" FOREIGN KEY ("tournamentId")
          REFERENCES "tournaments"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_tournament_participants_team" FOREIGN KEY ("teamId")
          REFERENCES "teams"("id") ON DELETE SET NULL
      )`
    );

    await queryRunner.query(
      `CREATE TABLE "tournament_stages" (
        "id" SERIAL NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "tournamentId" integer NOT NULL,
        "type" "tournament_stage_type" NOT NULL,
        "order" integer NOT NULL,
        "name" character varying(48) NOT NULL,
        "groupCount" integer,
        "advanceCount" integer,
        CONSTRAINT "PK_tournament_stages" PRIMARY KEY ("id"),
        CONSTRAINT "FK_tournament_stages_tournament" FOREIGN KEY ("tournamentId")
          REFERENCES "tournaments"("id") ON DELETE CASCADE
      )`
    );

    await queryRunner.query(
      `CREATE TABLE "tournament_matches" (
        "id" SERIAL NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "tournamentId" integer NOT NULL,
        "stageId" integer NOT NULL,
        "groupIndex" integer,
        "round" integer,
        "slot" integer,
        "participantOneId" integer,
        "participantTwoId" integer,
        "winnerId" integer,
        "scoreOne" integer,
        "scoreTwo" integer,
        "startsAt" TIMESTAMP,
        "nextMatchId" integer,
        "nextSlot" smallint,
        CONSTRAINT "PK_tournament_matches" PRIMARY KEY ("id"),
        CONSTRAINT "FK_tournament_matches_tournament" FOREIGN KEY ("tournamentId")
          REFERENCES "tournaments"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_tournament_matches_stage" FOREIGN KEY ("stageId")
          REFERENCES "tournament_stages"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_tournament_matches_p_one" FOREIGN KEY ("participantOneId")
          REFERENCES "tournament_participants"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_tournament_matches_p_two" FOREIGN KEY ("participantTwoId")
          REFERENCES "tournament_participants"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_tournament_matches_winner" FOREIGN KEY ("winnerId")
          REFERENCES "tournament_participants"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_tournament_matches_next" FOREIGN KEY ("nextMatchId")
          REFERENCES "tournament_matches"("id") ON DELETE SET NULL
      )`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tournament_matches_tournament" ON "tournament_matches" ("tournamentId")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "tournament_matches"`);
    await queryRunner.query(`DROP TABLE "tournament_stages"`);
    await queryRunner.query(`DROP TABLE "tournament_participants"`);
    await queryRunner.query(`DROP TABLE "tournaments"`);
    await queryRunner.query(`DROP TYPE "tournament_stage_type"`);
    await queryRunner.query(`DROP TYPE "tournament_status"`);
    await queryRunner.query(`DROP TYPE "tournament_format"`);
  }
}
