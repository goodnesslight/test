import { MigrationInterface, QueryRunner } from 'typeorm';

export class OrganizationAddSlug1780876800000 implements MigrationInterface {
  name: string = 'OrganizationAddSlug1780876800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organizations" ADD COLUMN "slug" character varying(48)`
    );
    await queryRunner.query(
      `UPDATE "organizations" SET "slug" = 'org-' || "id" WHERE "slug" IS NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "organizations" ALTER COLUMN "slug" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "organizations" ADD CONSTRAINT "UQ_organizations_slug" UNIQUE ("slug")`
    );
    await queryRunner.query(
      `ALTER TABLE "organizations" ALTER COLUMN "ownerId" DROP NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organizations" ALTER COLUMN "ownerId" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "organizations" DROP CONSTRAINT "UQ_organizations_slug"`
    );
    await queryRunner.query(`ALTER TABLE "organizations" DROP COLUMN "slug"`);
  }
}
