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
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log(`Found ${res.rows.length} tables in medusa_db:`);
    res.rows.forEach((row, i) => {
      console.log(`  ${(i + 1).toString().padStart(3, ' ')}. ${row.table_name}`);
    });

    await client.end();
  } catch (err) {
    console.error('Error querying medusa_db:', err.message);
    process.exit(1);
  }
}

main();
