import { MigrationInterface, QueryRunner } from 'typeorm';

// Users have no username — identity is strictly first + last name. Backfills any
// missing names from the old username, makes firstName/lastName NOT NULL, and
// drops the username column. Runs AFTER team nicknames are captured from username.
export class UserRequireNameDropUsername1781568000000
  implements MigrationInterface
{
  name: string = 'UserRequireNameDropUsername1781568000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "users"
        SET "firstName" = COALESCE(NULLIF("firstName", ''), "username"),
            "lastName" = COALESCE("lastName", '')`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "firstName" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "lastName" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_users_username"`
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "username"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Best-effort reverse: the original unique usernames cannot be recovered, so
    // seed placeholders derived from the id to satisfy the unique constraint.
    await queryRunner.query(
      `ALTER TABLE "users" ADD "username" character varying(32)`
    );
    await queryRunner.query(
      `UPDATE "users" SET "username" = 'user_' || "id"`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_users_username" UNIQUE ("username")`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "lastName" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "firstName" DROP NOT NULL`
    );
  }
}
