import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserCreate1780444800000 implements MigrationInterface {
  name: string = 'UserCreate1780444800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "locale_type" AS ENUM ('ru', 'en')`);
    await queryRunner.query(
      `CREATE TABLE "users" (
        "id" SERIAL NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "username" character varying(32) NOT NULL,
        "locale" "locale_type" NOT NULL DEFAULT 'ru',
        "calendarToken" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" character varying(320),
        "passwordHash" character varying,
        "firstName" character varying(64),
        "lastName" character varying(64),
        "avatarUrl" character varying,
        "googleId" character varying(64),
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "UQ_users_username" UNIQUE ("username"),
        CONSTRAINT "UQ_users_calendarToken" UNIQUE ("calendarToken"),
        CONSTRAINT "UQ_users_googleId" UNIQUE ("googleId")
      )`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "locale_type"`);
  }
}
