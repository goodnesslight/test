import { MigrationInterface, QueryRunner } from 'typeorm';

// Users are identified by first + last name; organization invites no longer
// carry a username, and firstName/lastName become required.
export class OrganizationInviteDropUsername1781481600000
  implements MigrationInterface
{
  name: string = 'OrganizationInviteDropUsername1781481600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "organization_invites"
        SET "firstName" = COALESCE(NULLIF("firstName", ''), "username"),
            "lastName" = COALESCE("lastName", '')`
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invites" ALTER COLUMN "firstName" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invites" ALTER COLUMN "lastName" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invites" DROP COLUMN "username"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization_invites" ADD "username" character varying(32)`
    );
    await queryRunner.query(
      `UPDATE "organization_invites" SET "username" = "firstName"`
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invites" ALTER COLUMN "username" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invites" ALTER COLUMN "lastName" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invites" ALTER COLUMN "firstName" DROP NOT NULL`
    );
  }
}
