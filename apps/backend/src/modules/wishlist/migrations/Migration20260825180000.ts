import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260825180000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_wishlist_item_variant_id" ON "wishlist_item" ("variant_id") WHERE deleted_at IS NULL;`);
    this.addSql(`DROP INDEX IF EXISTS "idx_wishlist_item_customer_product_unique";`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "idx_wishlist_item_customer_variant_unique" ON "wishlist_item" ("customer_id", "variant_id") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`DROP INDEX IF EXISTS "idx_wishlist_item_customer_variant_unique";`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "idx_wishlist_item_customer_product_unique" ON "wishlist_item" ("customer_id", "product_id") WHERE deleted_at IS NULL;`);
  }

}
