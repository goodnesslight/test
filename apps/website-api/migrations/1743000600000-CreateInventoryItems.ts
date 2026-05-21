import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInventoryItems1743000600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "inventory_items" (
        "inventoryId" integer NOT NULL,
        "itemId" integer NOT NULL,
        CONSTRAINT "PK_inventory_items" PRIMARY KEY ("inventoryId", "itemId"),
        CONSTRAINT "FK_inventory_items_inventoryId" FOREIGN KEY ("inventoryId") REFERENCES "inventories"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_inventory_items_itemId" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_inventory_items_inventoryId" ON "inventory_items" ("inventoryId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_inventory_items_itemId" ON "inventory_items" ("itemId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "inventory_items"`);
  }
}
