import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdminCreate1780444800000 implements MigrationInterface {
  name: string = 'AdminCreate1780444800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "admins" (
        "id" SERIAL NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "email" character varying(320) NOT NULL,
        "passwordHash" character varying NOT NULL,
        "firstName" character varying(64),
        "lastName" character varying(64),
        "refreshTokenHash" character varying,
        CONSTRAINT "PK_admins" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_admins_email" UNIQUE ("email")
      )`
    );

    // Seed the first platform admin. Default credentials:
    //   email:    admin@backoffice.local
    //   password: admin12345
    // Change the password after the first login.
    await queryRunner.query(
      `INSERT INTO "admins" ("email", "passwordHash", "firstName", "lastName")
        VALUES (
          'admin@backoffice.local',
          '$argon2id$v=19$m=65536,t=3,p=4$OZ/s+iJNuEKuWGppH1b+Qw$GIys0OMaLGIs/2AnxpVgCOonZFw1EoMYhPy8GNCYjvY',
          'Platform',
          'Admin'
        )`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "admins"`);
  }
}
