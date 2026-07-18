import { MigrationInterface, QueryRunner } from 'typeorm';

export class RequestCreate1780617600000 implements MigrationInterface {
  name: string = 'RequestCreate1780617600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "request_status" AS ENUM ('pending', 'approved', 'rejected')`
    );
    await queryRunner.query(
      `CREATE TABLE "requests" (
        "id" SERIAL NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "name" character varying(64) NOT NULL,
        "email" character varying(320) NOT NULL,
        "organizationName" character varying(48) NOT NULL,
        "status" "request_status" NOT NULL DEFAULT 'pending',
        "message" text,
        CONSTRAINT "PK_requests" PRIMARY KEY ("id")
      )`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "requests"`);
    await queryRunner.query(`DROP TYPE "request_status"`);
  }
}
