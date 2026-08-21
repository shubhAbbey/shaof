import { Client } from 'pg';
import Redis from 'ioredis';

const PG_HOST = process.env.POSTGRES_HOST || 'localhost';
const PG_PORT = parseInt(process.env.POSTGRES_PORT || '5432', 10);
const PG_USER = process.env.POSTGRES_USER || 'postgres';
const PG_PASSWORD = process.env.POSTGRES_PASSWORD || 'postgres_secure_password';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);

async function testPostgresDb(dbName) {
  const client = new Client({
    host: PG_HOST,
    port: PG_PORT,
    user: PG_USER,
    password: PG_PASSWORD,
    database: dbName,
  });

  try {
    await client.connect();
    const res = await client.query('SELECT current_database(), version();');
    console.log(`[PASS] PostgreSQL database "${dbName}" is reachable and queryable.`);
    console.log(`       Connected to: ${res.rows[0].current_database}`);
    await client.end();
    return true;
  } catch (err) {
    console.error(`[FAIL] Could not connect to PostgreSQL database "${dbName}":`, err.message);
    try {
      await client.end();
    } catch {}
    return false;
  }
}

async function testRedis() {
  const redis = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    maxRetriesPerRequest: 1,
    connectTimeout: 5000,
  });

  try {
    const pong = await redis.ping();
    console.log(`[PASS] Redis is reachable at ${REDIS_HOST}:${REDIS_PORT} (PING -> ${pong}).`);
    
    // Test write/read key
    await redis.set('infra:test_key', 'ok', 'EX', 10);
    const val = await redis.get('infra:test_key');
    if (val === 'ok') {
      console.log(`[PASS] Redis write/read verified successfully.`);
    }
    await redis.quit();
    return true;
  } catch (err) {
    console.error(`[FAIL] Could not connect to Redis at ${REDIS_HOST}:${REDIS_PORT}:`, err.message);
    try {
      await redis.quit();
    } catch {}
    return false;
  }
}

async function main() {
  console.log('====================================================');
  console.log('Verifying Local Infrastructure (PostgreSQL & Redis)');
  console.log('====================================================');

  const medusaDbOk = await testPostgresDb('medusa_db');
  const strapiDbOk = await testPostgresDb('strapi_db');
  const redisOk = await testRedis();

  console.log('----------------------------------------------------');
  if (medusaDbOk && strapiDbOk && redisOk) {
    console.log('All local infrastructure components are HEALTHY!');
    process.exit(0);
  } else {
    console.error('One or more infrastructure components failed verification.');
    process.exit(1);
  }
}

main();
