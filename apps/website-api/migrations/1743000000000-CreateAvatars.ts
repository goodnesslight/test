import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAvatars1743000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "avatars" (
        "id" SERIAL NOT NULL,
        "nameKey" character varying NOT NULL,
        "descriptionKey" character varying NOT NULL,
        "imagePath" character varying NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_avatars" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      INSERT INTO "avatars" ("nameKey", "descriptionKey", "imagePath")
      VALUES ('avatar.default.name', 'avatar.default.description', '/avatars/default.png')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "avatars"`);
  }
}
