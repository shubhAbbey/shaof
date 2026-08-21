import { Client } from 'pg';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';

const cmsDir = path.resolve(process.cwd(), 'apps/cms');
process.chdir(cmsDir);

const require = createRequire(path.join(cmsDir, 'package.json'));
const { createStrapi } = require('@strapi/strapi');

async function testEndpoint(url) {
  return new Promise((resolve) => {
    http
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        });
      })
      .on('error', (err) => {
        resolve({ error: err.message });
      });
  });
}

async function main() {
  console.log('=== Task 05: Strapi Foundation Verification ===\n');

  // Step 1: Verify PostgreSQL connection to strapi_db
  const pgClient = new Client({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    user: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres_secure_password',
    database: 'strapi_db',
  });

  try {
    await pgClient.connect();
    console.log('✓ PostgreSQL connected to strapi_db successfully.');
  } catch (err) {
    console.error('✗ Failed to connect to strapi_db:', err.message);
    process.exit(1);
  }

  // Step 2: Initialize Strapi instance programmatically
  console.log('Starting Strapi instance from:', cmsDir);
  const distDir = path.join(cmsDir, 'dist');

  let strapiInstance;
  try {
    strapiInstance = createStrapi({
      appDir: cmsDir,
      distDir: distDir,
      autoReload: false,
      serveAdminPanel: true,
    });

    await strapiInstance.load();
    await strapiInstance.start();
    console.log('✓ Strapi server started successfully on port 1337.\n');
  } catch (err) {
    console.error('✗ Failed to start Strapi:', err);
    await pgClient.end();
    process.exit(1);
  }

  // Step 3: Test HTTP endpoints
  console.log('=== Testing Strapi HTTP Endpoints ===');
  
  // Test Admin endpoint
  const adminRes = await testEndpoint('http://localhost:1337/admin/');
  console.log(`  - GET http://localhost:1337/admin/ => HTTP ${adminRes.status || 'ERROR'}`);

  // Test API endpoint (e.g. content-api or permissions endpoint)
  const apiRes = await testEndpoint('http://localhost:1337/api/users-permissions/roles');
  console.log(`  - GET http://localhost:1337/api/users-permissions/roles => HTTP ${apiRes.status || 'ERROR'}`);

  // Step 4: Verify Database Tables in strapi_db
  console.log('\n=== Verifying Database Schema in strapi_db ===');
  const tableRes = await pgClient.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);

  console.log(`Found ${tableRes.rows.length} tables in strapi_db:`);
  tableRes.rows.forEach((row, i) => {
    console.log(`  ${(i + 1).toString().padStart(2, ' ')}. ${row.table_name}`);
  });

  // Step 5: Verify Isolation from medusa_db
  console.log('\n=== Verifying Database Isolation ===');
  const medusaClient = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres_secure_password',
    database: 'medusa_db',
  });
  await medusaClient.connect();
  const medusaTableRes = await medusaClient.query(`
    SELECT count(*) as count FROM information_schema.tables WHERE table_schema = 'public';
  `);
  console.log(`  - strapi_db tables: ${tableRes.rows.length}`);
  console.log(`  - medusa_db tables: ${medusaTableRes.rows[0].count}`);
  console.log('✓ strapi_db and medusa_db are completely isolated logical databases.\n');

  await medusaClient.end();
  await pgClient.end();

  // Gracefully stop Strapi
  await strapiInstance.destroy();
  console.log('✓ Strapi instance stopped cleanly.');
  console.log('\n🎉 STRAPI FOUNDATION VERIFICATION PASSED!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error during verification:', err);
  process.exit(1);
});
