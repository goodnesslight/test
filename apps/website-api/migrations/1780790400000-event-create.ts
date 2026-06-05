import { MigrationInterface, QueryRunner } from 'typeorm';

export class EventCreate1780790400000 implements MigrationInterface {
  name: string = 'EventCreate1780790400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "event_type" AS ENUM ('practice', 'scrim', 'match', 'tournament')`
    );
    await queryRunner.query(
      `CREATE TYPE "attendance_status" AS ENUM ('going', 'maybe', 'declined')`
    );
    await queryRunner.query(
      `CREATE TABLE "events" (
        "id" SERIAL NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "teamId" integer NOT NULL,
        "type" "event_type" NOT NULL,
        "title" character varying(64) NOT NULL,
        "opponent" character varying(64),
        "startsAt" TIMESTAMP NOT NULL,
        "endsAt" TIMESTAMP,
        "description" character varying(500),
        CONSTRAINT "PK_events" PRIMARY KEY ("id"),
        CONSTRAINT "FK_events_team" FOREIGN KEY ("teamId")
          REFERENCES "teams"("id") ON DELETE CASCADE
      )`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_events_team_startsAt" ON "events" ("teamId", "startsAt")`
    );
    await queryRunner.query(
      `CREATE TABLE "event_attendances" (
        "id" SERIAL NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "eventId" integer NOT NULL,
        "userId" integer NOT NULL,
        "status" "attendance_status" NOT NULL,
        CONSTRAINT "PK_event_attendances" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_event_attendances_event_user" UNIQUE ("eventId", "userId"),
        CONSTRAINT "FK_event_attendances_event" FOREIGN KEY ("eventId")
          REFERENCES "events"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_event_attendances_user" FOREIGN KEY ("userId")
          REFERENCES "users"("id") ON DELETE CASCADE
      )`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "event_attendances"`);
    await queryRunner.query(`DROP TABLE "events"`);
    await queryRunner.query(`DROP TYPE "attendance_status"`);
    await queryRunner.query(`DROP TYPE "event_type"`);
  }
}
