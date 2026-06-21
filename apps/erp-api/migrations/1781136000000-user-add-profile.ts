import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserAddProfile1781136000000 implements MigrationInterface {
  name: string = 'UserAddProfile1781136000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "country" character varying(64)`
    );
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "birthDate" date`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "birthDate"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "country"`);
  }
}
