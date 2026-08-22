import http from 'http';

const urls = [
  { path: '/', expected: 200, name: 'Homepage (Task 09)' },
  { path: '/sale', expected: 200, name: 'Sale CMS Page (Task 10)' },
  { path: '/category/women', expected: 200, name: 'Category PLP: Women' },
  { path: '/category/women-sarees', expected: 200, name: 'Category PLP: Women Sarees' },
  { path: '/category/men', expected: 200, name: 'Category PLP: Men' },
  { path: '/category/curve-plus', expected: 200, name: 'Category PLP: Curve + Plus' },
  { path: '/category/non-existent-cat-xyz-99', expected: 404, name: 'Category PLP: 404 on Invalid Category' },
  { path: '/collections/summer-meadow', expected: 200, name: 'Collection PLP: Summer Meadow' },
  { path: '/collections/festive-glam', expected: 200, name: 'Collection PLP: Festive Glam' },
  { path: '/collections/capsule', expected: 200, name: 'Collection PLP: Linen & Silk Capsule' },
  { path: '/collections/non-existent-col-xyz-99', expected: 404, name: 'Collection PLP: 404 on Invalid Collection' },
  { path: '/brand/virasat-heritage', expected: 200, name: 'Brand PLP: Virasat Heritage' },
  { path: '/brand/gulmohar-jaipur', expected: 200, name: 'Brand PLP: Gulmohar Jaipur' },
  { path: '/brand/non-existent-brand-xyz-99', expected: 404, name: 'Brand PLP: 404 on Invalid Brand' },
  { path: '/sale/all', expected: 200, name: 'Sale PLP: All Flash Deals' },
];

async function verifyAll() {
  console.log('=== RUNTIME STOREFRONT PLP VERIFICATION ===\n');
  let passed = 0;
  let failed = 0;

  for (const item of urls) {
    await new Promise((resolve) => {
      http.get({ host: '127.0.0.1', port: 3000, path: item.path }, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          const is404Expected = item.expected === 404;
          const isNotFoundContent = body.includes('Page Not Found') || body.includes('404') || body.includes('does not exist');
          const valid = is404Expected
            ? res.statusCode === 404 || (res.statusCode === 200 && isNotFoundContent)
            : res.statusCode === item.expected;

          if (valid) {
            passed++;
            console.log(`✓ [PASS] ${item.name}`);
            console.log(`  Route: ${item.path} -> Status ${res.statusCode}${is404Expected ? ' (Rendered 404 Not Found UI)' : ''}`);
            if (res.statusCode === 200 && !is404Expected) {
              const hasTitle = body.includes('<h1') || body.includes('<title');
              console.log(`  HTML Rendering verified: Title tag present = ${hasTitle}`);
            }
          } else {
            failed++;
            console.error(`✗ [FAIL] ${item.name}`);
            console.error(`  Route: ${item.path} -> Status ${res.statusCode} (Expected ${item.expected})`);
          }
          console.log('');
          resolve();
        });
      }).on('error', (err) => {
        failed++;
        console.error(`✗ [FAIL] ${item.name} (${item.path}) -> ERROR: ${err.message}\n`);
        resolve();
      });
    });
  }

  console.log(`=== SUMMARY: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

verifyAll().catch(console.error);
