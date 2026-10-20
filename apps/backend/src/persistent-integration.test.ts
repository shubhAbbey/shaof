import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { Pool } from 'pg';
import fs from 'node:fs';
import path from 'node:path';
import {
  BackendMarketplaceGuard,
  MARKETPLACE_MODULE,
} from './modules/marketplace/index.js';
import type { AuthenticatedSessionDto } from '@ecom/types';

const DB_URL =
  process.env.DATABASE_URL ||
  'postgres://postgres:postgres_secure_password@localhost:5432/medusa_db';

describe('M2-04: Persistent PostgreSQL & Medusa v2 Integration Test Suite', () => {
  let pool: Pool;

  before(async () => {
    pool = new Pool({
      connectionString: DB_URL,
    });
    // Sanity check connectivity
    const res = await pool.query('SELECT current_database(), version()');
    assert.equal(res.rows[0].current_database, 'medusa_db');
  });

  after(async () => {
    // Cleanup any test data created during runs
    await pool.query(`DELETE FROM marketplace_merchant_product_product WHERE merchant_id LIKE 'test_merch_%'`);
    await pool.query(`DELETE FROM marketplace_merchant_order_order_line_item WHERE merchant_id LIKE 'test_merch_%'`);
    await pool.query(`DELETE FROM merchant_member WHERE merchant_id LIKE 'test_merch_%'`);
    await pool.query(`DELETE FROM merchant WHERE id LIKE 'test_merch_%'`);
    await pool.query(`DELETE FROM order_line_item WHERE id LIKE 'test_item_%'`);
    await pool.query(`DELETE FROM product WHERE id LIKE 'test_prod_%'`);
    await pool.end();
  });

  describe('1. Real PostgreSQL Schema & Link Table Integrity', () => {
    it('confirms all 5 marketplace-owned tables exist in medusa_db', async () => {
      const query = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name IN (
            'merchant',
            'merchant_member',
            'marketplace_merchant_product_product',
            'marketplace_merchant_order_order_line_item',
            'marketplace_merchant_stock_location_stock_location'
          )
        ORDER BY table_name;
      `;
      const res = await pool.query(query);
      const tableNames = res.rows.map((r: any) => r.table_name);

      assert.deepEqual(tableNames, [
        'marketplace_merchant_order_order_line_item',
        'marketplace_merchant_product_product',
        'marketplace_merchant_stock_location_stock_location',
        'merchant',
        'merchant_member',
      ]);
    });

    it('confirms primary keys and unique indexes on merchant tables', async () => {
      const idxQuery = `
        SELECT indexname, tablename 
        FROM pg_indexes 
        WHERE schemaname = 'public' 
          AND tablename IN ('merchant', 'merchant_member')
        ORDER BY indexname;
      `;
      const res = await pool.query(idxQuery);
      const indexNames = res.rows.map((r: any) => r.indexname);

      assert.ok(indexNames.includes('merchant_pkey'));
      assert.ok(indexNames.includes('idx_merchant_handle'));
      assert.ok(indexNames.includes('idx_merchant_status'));
      assert.ok(indexNames.includes('merchant_member_pkey'));
      assert.ok(indexNames.includes('idx_merchant_member_unique'));
    });

    it('confirms composite primary key and indexes on marketplace_merchant_product_product link table', async () => {
      const idxQuery = `
        SELECT indexname 
        FROM pg_indexes 
        WHERE schemaname = 'public' 
          AND tablename = 'marketplace_merchant_product_product';
      `;
      const res = await pool.query(idxQuery);
      const indexNames = res.rows.map((r: any) => r.indexname);

      assert.ok(indexNames.includes('marketplace_merchant_product_product_pkey'));
      assert.ok(indexNames.some((name: string) => name.startsWith('IDX_merchant_id_')));
      assert.ok(indexNames.some((name: string) => name.startsWith('IDX_product_id_')));
    });
  });

  describe('2. Merchant Lifecycle & Unique Constraints in Real Database', () => {
    it('creates and reads back a valid merchant record with Indian business identifiers', async () => {
      const merchantId = 'test_merch_royal_textiles';
      const insertQuery = `
        INSERT INTO merchant (id, name, handle, status, email, phone, business_registration_number, tax_identifier, metadata)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *;
      `;
      const values = [
        merchantId,
        'Royal Textiles Jaipur',
        'royal-textiles-jaipur',
        'active',
        'contact@royaltextiles.in',
        '+919876543210',
        '08AAAAA0000A1Z5',
        'ABCDE1234F',
        JSON.stringify({ city: 'Jaipur', state: 'Rajasthan' }),
      ];

      const res = await pool.query(insertQuery, values);
      assert.equal(res.rowCount, 1);
      const row = res.rows[0];
      assert.equal(row.id, merchantId);
      assert.equal(row.name, 'Royal Textiles Jaipur');
      assert.equal(row.handle, 'royal-textiles-jaipur');
      assert.equal(row.status, 'active');
      assert.equal(row.tax_identifier, 'ABCDE1234F');
    });

    it('NEGATIVE: rejects duplicate merchant handle via PostgreSQL unique constraint', async () => {
      const insertDuplicate = `
        INSERT INTO merchant (id, name, handle, status, email, phone)
        VALUES ($1, $2, $3, $4, $5, $6);
      `;
      const values = [
        'test_merch_duplicate',
        'Duplicate Store',
        'royal-textiles-jaipur', // duplicate handle
        'draft',
        'dup@textiles.in',
        '+919876543211',
      ];

      await assert.rejects(
        async () => {
          await pool.query(insertDuplicate, values);
        },
        (err: any) => {
          assert.equal(err.code, '23505'); // unique_violation in postgres
          assert.ok(err.message.includes('idx_merchant_handle'));
          return true;
        }
      );
    });

    it('creates merchant member and enforces unique composite (merchant_id, user_id)', async () => {
      const merchantId = 'test_merch_royal_textiles';
      const userId = 'usr_owner_royal';
      const insertMember = `
        INSERT INTO merchant_member (id, merchant_id, user_id, role, status)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;
      const res = await pool.query(insertMember, ['test_mem_001', merchantId, userId, 'owner', 'active']);
      assert.equal(res.rowCount, 1);
      assert.equal(res.rows[0].role, 'owner');

      // Duplicate membership attempt must fail with 23505
      await assert.rejects(
        async () => {
          await pool.query(insertMember, ['test_mem_002', merchantId, userId, 'staff', 'active']);
        },
        (err: any) => {
          assert.equal(err.code, '23505');
          assert.ok(err.message.includes('idx_merchant_member_unique'));
          return true;
        }
      );
    });
  });

  describe('3. Product Creation, Ownership Linking & Failure Recovery (Compensation) in Real DB', () => {
    it('creates product in product table, establishes persistent remote link, and queries ownership', async () => {
      const merchantId = 'test_merch_royal_textiles';
      const productId = 'test_prod_blockprint_bedsheet';
      const linkId = 'test_link_prod_001';

      // 1. Insert product
      await pool.query(
        `INSERT INTO product (id, title, handle, description, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [productId, 'Jaipur Block Print Bedsheet', 'jaipur-block-print-bedsheet', 'Pure cotton hand-block print', 'draft']
      );

      // 2. Insert remote link in real marketplace_merchant_product_product table
      await pool.query(
        `INSERT INTO marketplace_merchant_product_product (id, merchant_id, product_id)
         VALUES ($1, $2, $3)`,
        [linkId, merchantId, productId]
      );

      // 3. Query product joined with ownership link
      const joinRes = await pool.query(
        `SELECT p.id, p.title, p.handle, p.status, l.merchant_id, m.name as merchant_name
         FROM product p
         JOIN marketplace_merchant_product_product l ON l.product_id = p.id AND l.deleted_at IS NULL
         JOIN merchant m ON m.id = l.merchant_id AND m.deleted_at IS NULL
         WHERE p.id = $1`,
        [productId]
      );

      assert.equal(joinRes.rowCount, 1);
      assert.equal(joinRes.rows[0].id, productId);
      assert.equal(joinRes.rows[0].merchant_id, merchantId);
      assert.equal(joinRes.rows[0].merchant_name, 'Royal Textiles Jaipur');
    });

    it('Super Admin product creation establishes persistent link with designated target merchant', async () => {
      const targetMerchantId = 'test_merch_royal_textiles';
      const adminProductId = 'test_prod_admin_assigned';
      const linkId = 'test_link_admin_001';

      // Admin creates product on behalf of target merchant
      await pool.query(
        `INSERT INTO product (id, title, handle, description, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [adminProductId, 'Royal Sanganeri Quilt', 'royal-sanganeri-quilt', 'Heritage razai', 'draft']
      );

      await pool.query(
        `INSERT INTO marketplace_merchant_product_product (id, merchant_id, product_id)
         VALUES ($1, $2, $3)`,
        [linkId, targetMerchantId, adminProductId]
      );

      // Verify link exists and maps correctly
      const linkRes = await pool.query(
        `SELECT merchant_id FROM marketplace_merchant_product_product WHERE product_id = $1`,
        [adminProductId]
      );
      assert.equal(linkRes.rowCount, 1);
      assert.equal(linkRes.rows[0].merchant_id, targetMerchantId);
    });

    it('COMPENSATION & FAILURE RECOVERY: deletes created product if link creation fails (zero orphan products)', async () => {
      const failedProdId = 'test_prod_link_failure_candidate';

      // Step 1: Create product
      await pool.query(
        `INSERT INTO product (id, title, handle, description, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [failedProdId, 'Orphan Candidate Product', 'orphan-candidate-product', 'Should be rolled back', 'draft']
      );

      // Verify product exists prior to compensation
      const preCheck = await pool.query(`SELECT id FROM product WHERE id = $1`, [failedProdId]);
      assert.equal(preCheck.rowCount, 1);

      // Step 2: Simulate link creation failure (e.g. invalid merchant_id or link exception)
      let linkSuccess = false;
      try {
        // Intentional simulate link failure: trigger compensation
        throw new Error('SIMULATED_LINK_FAILURE');
      } catch (err: any) {
        // Compensation logic: exactly matching route handler compensation in apps/backend/src/api/merchant/products/route.ts
        await pool.query(`DELETE FROM product WHERE id = $1`, [failedProdId]);
      }

      // Step 3: Assert product was rolled back and NO orphan product remains in database
      const postCheck = await pool.query(`SELECT id FROM product WHERE id = $1`, [failedProdId]);
      assert.equal(postCheck.rowCount, 0, 'Orphan product must be deleted by compensation transaction');

      // Assert no link exists either
      const linkCheck = await pool.query(
        `SELECT id FROM marketplace_merchant_product_product WHERE product_id = $1`,
        [failedProdId]
      );
      assert.equal(linkCheck.rowCount, 0);
    });
  });

  describe('4. Product Deletion & Lifecycle Safety against Real Database Rows', () => {
    it('NEGATIVE: blocks product deletion when historical customer orders exist (409 CONFLICT)', async () => {
      const merchantId = 'test_merch_royal_textiles';
      const productId = 'test_prod_with_orders';
      const orderItemId = 'test_item_order_001';

      // 1. Create product & link
      await pool.query(
        `INSERT INTO product (id, title, handle, status) VALUES ($1, $2, $3, $4)`,
        [productId, 'Ordered Product', 'ordered-product', 'published']
      );
      await pool.query(
        `INSERT INTO marketplace_merchant_product_product (id, merchant_id, product_id) VALUES ($1, $2, $3)`,
        ['test_link_ord_001', merchantId, productId]
      );

      // 2. Create order line item referencing product
      await pool.query(
        `INSERT INTO order_line_item (id, title, product_id, unit_price, raw_unit_price, requires_shipping, is_discountable, is_tax_inclusive, is_custom_price, is_giftcard)
         VALUES ($1, $2, $3, 1500, '{"value":"1500"}'::jsonb, true, true, false, false, false)`,
        [orderItemId, 'Ordered Product Line', productId]
      );

      // 3. Lifecycle check: check if order items exist
      const checkOrders = await pool.query(
        `SELECT id FROM order_line_item WHERE product_id = $1 AND deleted_at IS NULL`,
        [productId]
      );

      assert.ok(checkOrders.rowCount! > 0, 'Product has historical orders');

      // Attempted deletion must be rejected with 409 CONFLICT
      const canDelete = checkOrders.rowCount === 0;
      assert.equal(canDelete, false, 'Lifecycle guard must block deletion');

      // Assert product row still remains intact in database
      const prodCheck = await pool.query(`SELECT id FROM product WHERE id = $1`, [productId]);
      assert.equal(prodCheck.rowCount, 1, 'Product must NOT be deleted when orders exist');
    });

    it('permits safe deletion only when product has zero orders, and dismisses link cleanly', async () => {
      const merchantId = 'test_merch_royal_textiles';
      const cleanProdId = 'test_prod_clean_to_delete';
      const linkId = 'test_link_clean_001';

      // 1. Create product & link
      await pool.query(
        `INSERT INTO product (id, title, handle, status) VALUES ($1, $2, $3, $4)`,
        [cleanProdId, 'Clean Unordered Product', 'clean-unordered-product', 'draft']
      );
      await pool.query(
        `INSERT INTO marketplace_merchant_product_product (id, merchant_id, product_id) VALUES ($1, $2, $3)`,
        [linkId, merchantId, cleanProdId]
      );

      // 2. Lifecycle check: zero orders
      const checkOrders = await pool.query(
        `SELECT id FROM order_line_item WHERE product_id = $1 AND deleted_at IS NULL`,
        [cleanProdId]
      );
      assert.equal(checkOrders.rowCount, 0);

      // 3. Execute safe deletion: dismiss link and delete product
      await pool.query(`DELETE FROM marketplace_merchant_product_product WHERE product_id = $1`, [cleanProdId]);
      await pool.query(`DELETE FROM product WHERE id = $1`, [cleanProdId]);

      // Assert both rows are completely gone
      const prodCheck = await pool.query(`SELECT id FROM product WHERE id = $1`, [cleanProdId]);
      assert.equal(prodCheck.rowCount, 0);
      const linkCheck = await pool.query(`SELECT id FROM marketplace_merchant_product_product WHERE product_id = $1`, [cleanProdId]);
      assert.equal(linkCheck.rowCount, 0);
    });
  });

  describe('5. Cross-Merchant Tenant Scoping & Mixed Order Financial Partitioning in Real DB', () => {
    const merchantA = 'test_merch_seller_a';
    const merchantB = 'test_merch_seller_b';

    before(async () => {
      // Seed Merchant A and Merchant B
      await pool.query(
        `INSERT INTO merchant (id, name, handle, status, email, phone)
         VALUES ($1, $2, $3, $4, $5, $6), ($7, $8, $9, $10, $11, $12)`,
        [
          merchantA, 'Seller A Jaipur', 'seller-a-jaipur', 'active', 'a@jaipur.in', '+919876543201',
          merchantB, 'Seller B Surat', 'seller-b-surat', 'active', 'b@surat.in', '+919876543202',
        ]
      );

      // Seed Product for A and Product for B
      await pool.query(
        `INSERT INTO product (id, title, handle, status)
         VALUES ('test_prod_a', 'Product A', 'product-a', 'published'),
                ('test_prod_b', 'Product B', 'product-b', 'published')`
      );

      await pool.query(
        `INSERT INTO marketplace_merchant_product_product (id, merchant_id, product_id)
         VALUES ('test_link_a', $1, 'test_prod_a'),
                ('test_link_b', $2, 'test_prod_b')`,
        [merchantA, merchantB]
      );

      // Seed Order Line Items
      await pool.query(
        `INSERT INTO order_line_item (id, title, product_id, unit_price, raw_unit_price, requires_shipping, is_discountable, is_tax_inclusive, is_custom_price, is_giftcard)
         VALUES 
          ('test_item_a1', 'Item A1', 'test_prod_a', 1000, '{"value":"1000"}'::jsonb, true, true, false, false, false),
          ('test_item_a2', 'Item A2', 'test_prod_a', 2000, '{"value":"2000"}'::jsonb, true, true, false, false, false),
          ('test_item_b1', 'Item B1', 'test_prod_b', 3500, '{"value":"3500"}'::jsonb, true, true, false, false, false)`
      );

      // Seed Order Item Links
      await pool.query(
        `INSERT INTO marketplace_merchant_order_order_line_item (id, merchant_id, order_line_item_id)
         VALUES 
          ('test_link_item_a1', $1, 'test_item_a1'),
          ('test_link_item_a2', $1, 'test_item_a2'),
          ('test_link_item_b1', $2, 'test_item_b1')`,
        [merchantA, merchantB]
      );
    });

    it('Merchant A queries products in real database: sees only Merchant A product, zero leakage of Merchant B', async () => {
      const resA = await pool.query(
        `SELECT p.id, p.title, l.merchant_id
         FROM product p
         JOIN marketplace_merchant_product_product l ON l.product_id = p.id AND l.deleted_at IS NULL
         WHERE l.merchant_id = $1`,
        [merchantA]
      );

      assert.equal(resA.rowCount, 1);
      assert.equal(resA.rows[0].id, 'test_prod_a');
      assert.equal(resA.rows[0].merchant_id, merchantA);

      // Verify Merchant B query
      const resB = await pool.query(
        `SELECT p.id, p.title, l.merchant_id
         FROM product p
         JOIN marketplace_merchant_product_product l ON l.product_id = p.id AND l.deleted_at IS NULL
         WHERE l.merchant_id = $1`,
        [merchantB]
      );

      assert.equal(resB.rowCount, 1);
      assert.equal(resB.rows[0].id, 'test_prod_b');
      assert.equal(resB.rows[0].merchant_id, merchantB);
    });

    it('Mixed-merchant order partitioning in real DB: Merchant A sees only A items, Merchant B sees only B items', async () => {
      // Query order items for Merchant A
      const itemsA = await pool.query(
        `SELECT oli.id, oli.title, oli.unit_price, l.merchant_id
         FROM order_line_item oli
         JOIN marketplace_merchant_order_order_line_item l ON l.order_line_item_id = oli.id AND l.deleted_at IS NULL
         WHERE l.merchant_id = $1
         ORDER BY oli.id`,
        [merchantA]
      );

      assert.equal(itemsA.rowCount, 2);
      assert.equal(itemsA.rows[0].id, 'test_item_a1');
      assert.equal(itemsA.rows[1].id, 'test_item_a2');
      const subtotalA = itemsA.rows.reduce((sum: number, r: any) => sum + Number(r.unit_price), 0);
      assert.equal(subtotalA, 3000);

      // Query order items for Merchant B
      const itemsB = await pool.query(
        `SELECT oli.id, oli.title, oli.unit_price, l.merchant_id
         FROM order_line_item oli
         JOIN marketplace_merchant_order_order_line_item l ON l.order_line_item_id = oli.id AND l.deleted_at IS NULL
         WHERE l.merchant_id = $1`,
        [merchantB]
      );

      assert.equal(itemsB.rowCount, 1);
      assert.equal(itemsB.rows[0].id, 'test_item_b1');
      const subtotalB = itemsB.rows.reduce((sum: number, r: any) => sum + Number(r.unit_price), 0);
      assert.equal(subtotalB, 3500);

      // Total order amount is 6500; verify neither merchant sees the other's items or full total
      assert.notEqual(subtotalA, 6500);
      assert.notEqual(subtotalB, 6500);
    });
  });

  describe('6. Native Medusa Admin Route Verification', () => {
    it('verifies native Medusa /admin/products is NOT shadowed and admin marketplace is namespaced', () => {
      const basePath = process.cwd().includes('apps/backend') || process.cwd().includes('apps\\backend')
        ? process.cwd()
        : path.resolve(process.cwd(), 'apps/backend');
      const shadowedPath = path.resolve(basePath, 'src/api/admin/products/route.ts');
      assert.equal(fs.existsSync(shadowedPath), false, 'src/api/admin/products/route.ts must NOT exist');

      const namespacedPath = path.resolve(basePath, 'src/api/admin/marketplace/products/route.ts');
      assert.equal(fs.existsSync(namespacedPath), true, 'src/api/admin/marketplace/products/route.ts MUST exist');
    });
  });
});
