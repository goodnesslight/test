import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAccountAvatars1743000700000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "account_avatars" (
        "accountId" integer NOT NULL,
        "avatarId" integer NOT NULL,
        CONSTRAINT "PK_account_avatars" PRIMARY KEY ("accountId", "avatarId"),
        CONSTRAINT "FK_account_avatars_accountId" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_account_avatars_avatarId" FOREIGN KEY ("avatarId") REFERENCES "avatars"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_account_avatars_accountId" ON "account_avatars" ("accountId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_account_avatars_avatarId" ON "account_avatars" ("avatarId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "account_avatars"`);
  }
}
