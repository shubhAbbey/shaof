import { Migration } from "@medusajs/framework/mikro-orm/migrations";

/**
 * Migration20261019000000
 *
 * M2-03 Merchant Domain Foundation Migration:
 * - Creates 'merchant' table for multi-merchant profiles, status lifecycle, and verification data.
 * - Creates 'merchant_member' table for team memberships, roles, and status.
 * - Includes indexes for fast lookup and unique constraints.
 * - Fully reversible down() method without altering any core Medusa tables.
 */
export class Migration20261019000000 extends Migration {

  override async up(): Promise<void> {
    // 1. Create merchant table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "merchant" (
        "id" text NOT NULL,
        "name" text NOT NULL,
        "handle" text NOT NULL,
        "status" text NOT NULL DEFAULT 'draft',
        "email" text NOT NULL,
        "phone" text NOT NULL,
        "business_registration_number" text NULL,
        "tax_identifier" text NULL,
        "metadata" jsonb NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz NULL,
        CONSTRAINT "merchant_pkey" PRIMARY KEY ("id")
      );
    `);

    // Merchant indexes
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_merchant_name" ON "merchant" ("name") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "idx_merchant_handle" ON "merchant" ("handle") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_merchant_email" ON "merchant" ("email") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_merchant_status" ON "merchant" ("status") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_merchant_deleted_at" ON "merchant" ("deleted_at") WHERE deleted_at IS NULL;`);

    // 2. Create merchant_member table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "merchant_member" (
        "id" text NOT NULL,
        "merchant_id" text NOT NULL,
        "user_id" text NOT NULL,
        "role" text NOT NULL DEFAULT 'staff',
        "status" text NOT NULL DEFAULT 'active',
        "metadata" jsonb NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz NULL,
        CONSTRAINT "merchant_member_pkey" PRIMARY KEY ("id")
      );
    `);

    // Merchant Member indexes & unique constraint
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_merchant_member_merchant_id" ON "merchant_member" ("merchant_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_merchant_member_user_id" ON "merchant_member" ("user_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_merchant_member_status" ON "merchant_member" ("status") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "idx_merchant_member_unique" ON "merchant_member" ("merchant_id", "user_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_merchant_member_deleted_at" ON "merchant_member" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    // 100% reversible rollback without touching any Medusa core tables
    this.addSql(`DROP TABLE IF EXISTS "merchant_member" CASCADE;`);
    this.addSql(`DROP TABLE IF EXISTS "merchant" CASCADE;`);
  }

}
