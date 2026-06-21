import { MigrationInterface, QueryRunner } from 'typeorm';

export class OrganizationInviteCreate1781049600000
  implements MigrationInterface
{
  name: string = 'OrganizationInviteCreate1781049600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "organization_invites" (
        "id" SERIAL NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "organizationId" integer NOT NULL,
        "email" character varying(320) NOT NULL,
        "token" character varying(128) NOT NULL,
        "status" "invite_status" NOT NULL DEFAULT 'pending',
        "role" "organization_role" NOT NULL DEFAULT 'member',
        "expiresAt" TIMESTAMP NOT NULL,
        "invitedUserId" integer,
        CONSTRAINT "PK_organization_invites" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_organization_invites_token" UNIQUE ("token"),
        CONSTRAINT "FK_organization_invites_org" FOREIGN KEY ("organizationId")
          REFERENCES "organizations"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_organization_invites_user" FOREIGN KEY ("invitedUserId")
          REFERENCES "users"("id") ON DELETE SET NULL
      )`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_organization_invites_pending"
        ON "organization_invites" ("organizationId", "email")
        WHERE "status" = 'pending'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "organization_invites"`);
  }
}
