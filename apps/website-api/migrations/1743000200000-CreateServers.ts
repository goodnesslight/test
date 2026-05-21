import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateServers1743000200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "server_type_enum" AS ENUM ('DEATHMATCH', 'RETAKE', 'KREEDZ_CLIMBING')
    `);

    await queryRunner.query(`
      CREATE TABLE "servers" (
        "id" SERIAL NOT NULL,
        "ip" character varying NOT NULL,
        "port" integer NOT NULL,
        "type" "server_type_enum" NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_servers" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "servers"`);
    await queryRunner.query(`DROP TYPE "server_type_enum"`);
  }
}
