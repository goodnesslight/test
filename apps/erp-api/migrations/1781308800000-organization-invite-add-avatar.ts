import { MigrationInterface, QueryRunner } from 'typeorm';

export class OrganizationInviteAddAvatar1781308800000
  implements MigrationInterface
{
  name: string = 'OrganizationInviteAddAvatar1781308800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization_invites" ADD COLUMN IF NOT EXISTS "avatarUrl" character varying`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization_invites" DROP COLUMN IF EXISTS "avatarUrl"`
    );
  }
}
