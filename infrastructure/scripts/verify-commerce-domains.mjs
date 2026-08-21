import { Client } from 'pg';

async function main() {
  const client = new Client({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres_secure_password',
    database: 'medusa_db',
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL (medusa_db) successfully.\n');

    const domainTables = {
      Promotions: [
        'promotion',
        'promotion_application_method',
        'promotion_rule',
        'promotion_rule_value',
        'promotion_campaign',
        'promotion_campaign_budget',
        'cart_promotion',
        'order_promotion',
      ],
      'Shipping & Fulfillment': [
        'fulfillment',
        'fulfillment_set',
        'fulfillment_item',
        'fulfillment_provider',
        'shipping_option',
        'shipping_option_type',
        'shipping_profile',
        'stock_location',
        'service_zone',
        'geo_zone',
      ],
      'Orders & Workflows': [
        'order',
        'order_line_item',
        'order_change',
        'order_change_action',
        'order_summary',
        'order_transaction',
        'order_shipping_method',
      ],
      'Returns & Refunds': [
        'return',
        'return_item',
        'return_reason',
        'refund',
        'refund_reason',
      ],
      'Payment Provider Abstraction': [
        'payment',
        'payment_collection',
        'payment_session',
        'payment_provider',
      ],
    };

    let allPassed = true;

    for (const [domain, tables] of Object.entries(domainTables)) {
      console.log(`=== Domain: ${domain} ===`);
      const res = await client.query(
        `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ANY($1::text[])`,
        [tables]
      );
      const existingTables = new Set(res.rows.map((r) => r.table_name));

      for (const table of tables) {
        if (existingTables.has(table)) {
          // Query column count
          const colRes = await client.query(
            `SELECT count(*) as count FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1`,
            [table]
          );
          console.log(`  ✓ ${table} (columns: ${colRes.rows[0].count})`);
        } else {
          console.log(`  ✗ ${table} (MISSING)`);
          allPassed = false;
        }
      }
      console.log('');
    }

    // Inspect critical columns in key domain tables
    console.log('=== Inspecting Core Table Schemas ===');
    const keyTables = ['order', 'return', 'refund', 'promotion', 'fulfillment', 'payment'];
    for (const table of keyTables) {
      const colRes = await client.query(
        `SELECT column_name, data_type, is_nullable 
         FROM information_schema.columns 
         WHERE table_schema = 'public' AND table_name = $1 
         ORDER BY ordinal_position LIMIT 6`,
        [table]
      );
      console.log(`Table '${table}' sample columns:`);
      colRes.rows.forEach((col) => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
      console.log('');
    }

    await client.end();

    if (allPassed) {
      console.log('🎉 ALL COMMERCE DOMAIN SCHEMAS VERIFIED SUCCESSFULLY!');
      process.exit(0);
    } else {
      console.error('❌ SOME REQUIRED TABLES ARE MISSING.');
      process.exit(1);
    }
  } catch (err) {
    console.error('Verification failed:', err.message);
    process.exit(1);
  }
}

main();
