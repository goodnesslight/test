import { MigrationInterface, QueryRunner } from 'typeorm';

export class OrganizationAddMemberRole1780963200000
  implements MigrationInterface
{
  name: string = 'OrganizationAddMemberRole1780963200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "organization_role" ADD VALUE IF NOT EXISTS 'member'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "organization_role" RENAME TO "organization_role_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "organization_role" AS ENUM ('owner', 'admin')`
    );
    await queryRunner.query(
      `ALTER TABLE "organization_members" ALTER COLUMN "role" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "organization_members" ALTER COLUMN "role" TYPE "organization_role" USING "role"::text::"organization_role"`
    );
    await queryRunner.query(
      `ALTER TABLE "organization_members" ALTER COLUMN "role" SET DEFAULT 'admin'`
    );
    await queryRunner.query(`DROP TYPE "organization_role_old"`);
  }
}
