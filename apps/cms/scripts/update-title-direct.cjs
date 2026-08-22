const { Client } = require('pg');

async function updateTitle(newTitle) {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres_secure_password',
    database: 'strapi_db',
  });

  await client.connect();
  const res = await client.query('UPDATE components_sections_heroes SET title = $1', [newTitle]);
  console.log(`✓ Updated ${res.rowCount} row(s) in components_sections_heroes to: "${newTitle}"`);
  await client.end();
}

const title = process.argv[2] || 'CMS HOMEPAGE TEST';
updateTitle(title).catch(console.error);
