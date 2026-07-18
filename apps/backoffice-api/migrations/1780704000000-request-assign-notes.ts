import { MigrationInterface, QueryRunner } from 'typeorm';

export class RequestAssignNotes1780704000000 implements MigrationInterface {
  name: string = 'RequestAssignNotes1780704000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Extend request_status with 'in_progress' via a transaction-safe
    // rename-swap (avoids the non-transactional ALTER TYPE ... ADD VALUE).
    await queryRunner.query(
      `ALTER TYPE "request_status" RENAME TO "request_status_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "request_status" AS ENUM ('pending', 'in_progress', 'approved', 'rejected')`
    );
    await queryRunner.query(
      `ALTER TABLE "requests" ALTER COLUMN "status" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "requests" ALTER COLUMN "status" TYPE "request_status" USING "status"::text::"request_status"`
    );
    await queryRunner.query(
      `ALTER TABLE "requests" ALTER COLUMN "status" SET DEFAULT 'pending'`
    );
    await queryRunner.query(`DROP TYPE "request_status_old"`);

    await queryRunner.query(
      `ALTER TABLE "requests" ADD "assigneeId" integer`
    );
    await queryRunner.query(
      `ALTER TABLE "requests" ADD CONSTRAINT "FK_requests_assignee"
        FOREIGN KEY ("assigneeId") REFERENCES "admins"("id")
        ON DELETE SET NULL ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `CREATE TABLE "request_notes" (
        "id" SERIAL NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "requestId" integer NOT NULL,
        "adminId" integer NOT NULL,
        "text" text NOT NULL,
        CONSTRAINT "PK_request_notes" PRIMARY KEY ("id"),
        CONSTRAINT "FK_request_notes_request" FOREIGN KEY ("requestId")
          REFERENCES "requests"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_request_notes_admin" FOREIGN KEY ("adminId")
          REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "request_notes"`);

    await queryRunner.query(
      `ALTER TABLE "requests" DROP CONSTRAINT "FK_requests_assignee"`
    );
    await queryRunner.query(`ALTER TABLE "requests" DROP COLUMN "assigneeId"`);

    // Revert request_status to its three-value form; collapse any in-progress
    // rows back to pending so the cast succeeds.
    await queryRunner.query(
      `UPDATE "requests" SET "status" = 'pending' WHERE "status" = 'in_progress'`
    );
    await queryRunner.query(
      `ALTER TYPE "request_status" RENAME TO "request_status_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "request_status" AS ENUM ('pending', 'approved', 'rejected')`
    );
    await queryRunner.query(
      `ALTER TABLE "requests" ALTER COLUMN "status" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "requests" ALTER COLUMN "status" TYPE "request_status" USING "status"::text::"request_status"`
    );
    await queryRunner.query(
      `ALTER TABLE "requests" ALTER COLUMN "status" SET DEFAULT 'pending'`
    );
    await queryRunner.query(`DROP TYPE "request_status_old"`);
  }
}
