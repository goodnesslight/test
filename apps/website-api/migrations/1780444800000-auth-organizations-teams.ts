import { MigrationInterface, QueryRunner } from 'typeorm';

export class AuthOrganizationsTeams1780444800000
  implements MigrationInterface
{
  name: string = 'AuthOrganizationsTeams1780444800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" (
        "id" SERIAL NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "email" character varying(320),
        "passwordHash" character varying,
        "username" character varying(32) NOT NULL,
        "avatarUrl" character varying,
        "googleId" character varying(64),
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "UQ_users_username" UNIQUE ("username"),
        CONSTRAINT "UQ_users_googleId" UNIQUE ("googleId")
      )`
    );
    await queryRunner.query(
      `CREATE TYPE "game_type" AS ENUM ('cs2', 'dota2', 'valorant', 'lol')`
    );
    await queryRunner.query(
      `CREATE TYPE "team_member_role" AS ENUM ('coach', 'captain', 'player', 'substitute')`
    );
    await queryRunner.query(
      `CREATE TABLE "organizations" (
        "id" SERIAL NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "name" character varying(48) NOT NULL,
        "tag" character varying(8) NOT NULL,
        "logoUrl" character varying,
        "ownerId" integer NOT NULL,
        CONSTRAINT "PK_organizations" PRIMARY KEY ("id"),
        CONSTRAINT "FK_organizations_owner" FOREIGN KEY ("ownerId")
          REFERENCES "users"("id") ON DELETE CASCADE
      )`
    );
    await queryRunner.query(
      `CREATE TABLE "teams" (
        "id" SERIAL NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "organizationId" integer NOT NULL,
        "name" character varying(48) NOT NULL,
        "game" "game_type" NOT NULL,
        CONSTRAINT "PK_teams" PRIMARY KEY ("id"),
        CONSTRAINT "FK_teams_organization" FOREIGN KEY ("organizationId")
          REFERENCES "organizations"("id") ON DELETE CASCADE
      )`
    );
    await queryRunner.query(
      `CREATE TABLE "team_members" (
        "id" SERIAL NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "teamId" integer NOT NULL,
        "userId" integer NOT NULL,
        "role" "team_member_role" NOT NULL DEFAULT 'player',
        CONSTRAINT "PK_team_members" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_team_members_team_user" UNIQUE ("teamId", "userId"),
        CONSTRAINT "FK_team_members_team" FOREIGN KEY ("teamId")
          REFERENCES "teams"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_team_members_user" FOREIGN KEY ("userId")
          REFERENCES "users"("id") ON DELETE CASCADE
      )`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "team_members"`);
    await queryRunner.query(`DROP TABLE "teams"`);
    await queryRunner.query(`DROP TABLE "organizations"`);
    await queryRunner.query(`DROP TYPE "team_member_role"`);
    await queryRunner.query(`DROP TYPE "game_type"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
