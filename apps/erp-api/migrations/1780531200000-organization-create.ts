import { MigrationInterface, QueryRunner } from 'typeorm';

export class OrganizationCreate1780531200000 implements MigrationInterface {
  name: string = 'OrganizationCreate1780531200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "organizations"`);
  }
}
