import { MigrationInterface, QueryRunner } from 'typeorm';

export class OrganizationCreate1780531200000 implements MigrationInterface {
  name: string = 'OrganizationCreate1780531200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "organization_role" AS ENUM ('owner', 'admin')`
    );
    await queryRunner.query(
      `CREATE TABLE "organizations" (
        "id" SERIAL NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "name" character varying(48) NOT NULL,
        "tag" character varying(8) NOT NULL,
        "logoUrl" character varying,
        "ownerId" integer NOT NULL,
        CONSTRAINT "PK_organizations" PRIMARY KEY ("id"),
        CONSTRAINT "FK_organizations_owner" FOREIGN KEY ("ownerId")
          REFERENCES "users"("id") ON DELETE CASCADE
      )`
    );
    await queryRunner.query(
      `CREATE TABLE "organization_members" (
        "id" SERIAL NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "organizationId" integer NOT NULL,
        "userId" integer NOT NULL,
        "role" "organization_role" NOT NULL DEFAULT 'admin',
        CONSTRAINT "PK_organization_members" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_organization_members_org_user" UNIQUE ("organizationId", "userId"),
        CONSTRAINT "FK_organization_members_org" FOREIGN KEY ("organizationId")
          REFERENCES "organizations"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_organization_members_user" FOREIGN KEY ("userId")
          REFERENCES "users"("id") ON DELETE CASCADE
      )`
    );
    await queryRunner.query(
      `INSERT INTO "organization_members" ("organizationId", "userId", "role")
        SELECT "id", "ownerId", 'owner' FROM "organizations"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "organization_members"`);
    await queryRunner.query(`DROP TABLE "organizations"`);
    await queryRunner.query(`DROP TYPE "organization_role"`);
  }
}
