import { MigrationInterface, QueryRunner } from 'typeorm';

// Tournaments are now a first-class feature, so the `tournament` event category
// is obsolete. Existing tournament events collapse to `match` before the value
// is removed from the enum.
export class EventRemoveTournamentType1781827200000
  implements MigrationInterface
{
  name: string = 'EventRemoveTournamentType1781827200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "events" SET "type" = 'match' WHERE "type" = 'tournament'`
    );
    await queryRunner.query(`ALTER TYPE "event_type" RENAME TO "event_type_old"`);
    await queryRunner.query(
      `CREATE TYPE "event_type" AS ENUM ('practice', 'scrim', 'match')`
    );
    await queryRunner.query(
      `ALTER TABLE "events" ALTER COLUMN "type" TYPE "event_type" USING "type"::text::"event_type"`
    );
    await queryRunner.query(`DROP TYPE "event_type_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "event_type" RENAME TO "event_type_old"`);
    await queryRunner.query(
      `CREATE TYPE "event_type" AS ENUM ('practice', 'scrim', 'match', 'tournament')`
    );
    await queryRunner.query(
      `ALTER TABLE "events" ALTER COLUMN "type" TYPE "event_type" USING "type"::text::"event_type"`
    );
    await queryRunner.query(`DROP TYPE "event_type_old"`);
  }
}
