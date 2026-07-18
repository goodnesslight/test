import { MigrationInterface, QueryRunner } from 'typeorm';

// Organizations can be disabled from the backoffice instead of being deleted.
// A disabled organization is preserved but blocked on the platform.
export class OrganizationAddActive1781654400000 implements MigrationInterface {
  name: string = 'OrganizationAddActive1781654400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organizations" ADD "isActive" boolean NOT NULL DEFAULT true`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organizations" DROP COLUMN "isActive"`
    );
  }
}
