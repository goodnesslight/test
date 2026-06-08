import { MigrationInterface, QueryRunner } from 'typeorm';

export class TeamCreate1780617600000 implements MigrationInterface {
  name: string = 'TeamCreate1780617600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "team_type" AS ENUM ('main', 'academy')`
    );
    await queryRunner.query(
      `CREATE TYPE "team_member_role" AS ENUM ('coach', 'player')`
    );
    await queryRunner.query(
      `CREATE TABLE "teams" (
        "id" SERIAL NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "gameId" integer NOT NULL,
        "type" "team_type" NOT NULL,
        CONSTRAINT "PK_teams" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_teams_game_type" UNIQUE ("gameId", "type"),
        CONSTRAINT "FK_teams_game" FOREIGN KEY ("gameId")
          REFERENCES "games"("id") ON DELETE CASCADE
      )`
    );
    await queryRunner.query(
      `CREATE TABLE "team_members" (
        "id" SERIAL NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "teamId" integer NOT NULL,
        "userId" integer NOT NULL,
        "role" "team_member_role" NOT NULL DEFAULT 'player',
        CONSTRAINT "PK_team_members" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_team_members_team_user" UNIQUE ("teamId", "userId"),
        CONSTRAINT "FK_team_members_team" FOREIGN KEY ("teamId")
          REFERENCES "teams"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_team_members_user" FOREIGN KEY ("userId")
          REFERENCES "users"("id") ON DELETE CASCADE
      )`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "team_members"`);
    await queryRunner.query(`DROP TABLE "teams"`);
    await queryRunner.query(`DROP TYPE "team_member_role"`);
    await queryRunner.query(`DROP TYPE "team_type"`);
  }
}
