import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateItems1743000400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "item_rarity_enum" AS ENUM (
        'CONSUMER_GRADE',
        'INDUSTRIAL_GRADE',
        'MIL_SPEC',
        'RESTRICTED',
        'CLASSIFIED',
        'COVERT',
        'CONTRABAND'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "items" (
        "id" SERIAL NOT NULL,
        "nameKey" character varying NOT NULL,
        "descriptionKey" character varying NOT NULL,
        "imagePath" character varying NOT NULL,
        "rarity" "item_rarity_enum" NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_items" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "items"`);
    await queryRunner.query(`DROP TYPE "item_rarity_enum"`);
  }
}
