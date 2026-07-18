import { MigrationInterface, QueryRunner } from 'typeorm';

// Nicknames (handles) belong to team memberships — players and coaches — not to
// users. Adds `nickname` to team_members and team_invites. Backfills existing
// rows from the invited user's soon-to-be-removed `users.username`, so this must
// run BEFORE the migration that drops that column.
export class TeamMemberAddNickname1781395200000 implements MigrationInterface {
  name: string = 'TeamMemberAddNickname1781395200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "team_members" ADD "nickname" character varying(32)`
    );
    await queryRunner.query(
      `UPDATE "team_members" tm SET "nickname" = u."username"
        FROM "users" u WHERE u."id" = tm."userId"`
    );
    await queryRunner.query(
      `ALTER TABLE "team_members" ALTER COLUMN "nickname" SET NOT NULL`
    );

    await queryRunner.query(
      `ALTER TABLE "team_invites" ADD "nickname" character varying(32)`
    );
    await queryRunner.query(
      `UPDATE "team_invites" ti SET "nickname" = u."username"
        FROM "users" u WHERE u."id" = ti."invitedUserId"`
    );
    await queryRunner.query(
      `ALTER TABLE "team_invites" ALTER COLUMN "nickname" SET NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "team_invites" DROP COLUMN "nickname"`);
    await queryRunner.query(`ALTER TABLE "team_members" DROP COLUMN "nickname"`);
  }
}
