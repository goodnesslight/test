import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInventories1743000500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "inventories" (
        "id" SERIAL NOT NULL,
        "accountId" integer NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_inventories_accountId" UNIQUE ("accountId"),
        CONSTRAINT "PK_inventories" PRIMARY KEY ("id"),
        CONSTRAINT "FK_inventories_accountId" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "inventories"`);
  }
}
