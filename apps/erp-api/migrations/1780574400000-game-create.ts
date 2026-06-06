import { MigrationInterface, QueryRunner } from 'typeorm';

export class GameCreate1780574400000 implements MigrationInterface {
  name: string = 'GameCreate1780574400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "game_type" AS ENUM ('cs2', 'dota2', 'valorant', 'lol')`
    );
    await queryRunner.query(
      `CREATE TABLE "games" (
        "id" SERIAL NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "organizationId" integer NOT NULL,
        "type" "game_type" NOT NULL,
        CONSTRAINT "PK_games" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_games_organization_type" UNIQUE ("organizationId", "type"),
        CONSTRAINT "FK_games_organization" FOREIGN KEY ("organizationId")
          REFERENCES "organizations"("id") ON DELETE CASCADE
      )`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "games"`);
    await queryRunner.query(`DROP TYPE "game_type"`);
  }
}
