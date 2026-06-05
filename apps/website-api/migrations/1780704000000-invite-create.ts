import { MigrationInterface, QueryRunner } from 'typeorm';

export class InviteCreate1780704000000 implements MigrationInterface {
  name: string = 'InviteCreate1780704000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "invite_status" AS ENUM ('pending', 'accepted', 'declined')`
    );
    await queryRunner.query(
      `CREATE TABLE "team_invites" (
        "id" SERIAL NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "teamId" integer NOT NULL,
        "invitedUserId" integer NOT NULL,
        "status" "invite_status" NOT NULL DEFAULT 'pending',
        "role" "team_member_role" NOT NULL DEFAULT 'player',
        CONSTRAINT "PK_team_invites" PRIMARY KEY ("id"),
        CONSTRAINT "FK_team_invites_team" FOREIGN KEY ("teamId")
          REFERENCES "teams"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_team_invites_user" FOREIGN KEY ("invitedUserId")
          REFERENCES "users"("id") ON DELETE CASCADE
      )`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_team_invites_pending"
        ON "team_invites" ("teamId", "invitedUserId")
        WHERE "status" = 'pending'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "team_invites"`);
    await queryRunner.query(`DROP TYPE "invite_status"`);
  }
}
