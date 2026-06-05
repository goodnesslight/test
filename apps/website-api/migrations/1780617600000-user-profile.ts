import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserProfile1780617600000 implements MigrationInterface {
  name: string = 'UserProfile1780617600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "locale_type" AS ENUM ('ru', 'en')`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "firstName" character varying(64)`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "lastName" character varying(64)`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "locale" "locale_type" NOT NULL DEFAULT 'ru'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "locale"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lastName"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "firstName"`);
    await queryRunner.query(`DROP TYPE "locale_type"`);
  }
}
