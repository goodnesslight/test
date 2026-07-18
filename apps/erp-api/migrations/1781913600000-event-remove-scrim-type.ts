import { MigrationInterface, QueryRunner } from 'typeorm';

// `scrim` is dropped as an event type; existing scrims collapse to `match`
// (both carry an opponent) before the value is removed from the enum.
export class EventRemoveScrimType1781913600000 implements MigrationInterface {
  name: string = 'EventRemoveScrimType1781913600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "events" SET "type" = 'match' WHERE "type" = 'scrim'`
    );
    await queryRunner.query(`ALTER TYPE "event_type" RENAME TO "event_type_old"`);
    await queryRunner.query(
      `CREATE TYPE "event_type" AS ENUM ('practice', 'match')`
    );
    await queryRunner.query(
      `ALTER TABLE "events" ALTER COLUMN "type" TYPE "event_type" USING "type"::text::"event_type"`
    );
    await queryRunner.query(`DROP TYPE "event_type_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "event_type" RENAME TO "event_type_old"`);
    await queryRunner.query(
      `CREATE TYPE "event_type" AS ENUM ('practice', 'scrim', 'match')`
    );
    await queryRunner.query(
      `ALTER TABLE "events" ALTER COLUMN "type" TYPE "event_type" USING "type"::text::"event_type"`
    );
    await queryRunner.query(`DROP TYPE "event_type_old"`);
  }
}
