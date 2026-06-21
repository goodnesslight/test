import { MigrationInterface, QueryRunner } from 'typeorm';

export class OrganizationInviteAddProfile1781222400000
  implements MigrationInterface
{
  name: string = 'OrganizationInviteAddProfile1781222400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization_invites" ADD COLUMN "username" character varying(32)`
    );
    await queryRunner.query(
      `UPDATE "organization_invites" SET "username" = split_part("email", '@', 1) WHERE "username" IS NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invites" ALTER COLUMN "username" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invites" ADD COLUMN "firstName" character varying(64)`
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invites" ADD COLUMN "lastName" character varying(64)`
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invites" ADD COLUMN "country" character varying(64)`
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invites" ADD COLUMN "birthDate" date`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization_invites" DROP COLUMN "birthDate"`
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invites" DROP COLUMN "country"`
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invites" DROP COLUMN "lastName"`
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invites" DROP COLUMN "firstName"`
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invites" DROP COLUMN "username"`
    );
  }
}
