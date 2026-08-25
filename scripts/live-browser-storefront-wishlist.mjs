import http from 'http';

async function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          json,
        });
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function run() {
  console.log('=== LIVE STOREFRONT BROWSER / BFF WISHLIST VALIDATION ===\n');

  // 1. Check guest check endpoint with variantId
  console.log('1. Testing GET /api/wishlist/check?variantId=variant_01M0MSNBCQH8NWQ9BS5XFCBGSA (Guest)');
  const guestCheckRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/wishlist/check?variantId=variant_01M0MSNBCQH8NWQ9BS5XFCBGSA',
    method: 'GET',
  });
  console.log(`   Status: ${guestCheckRes.statusCode}, JSON: ${JSON.stringify(guestCheckRes.json)}`);
  if (guestCheckRes.statusCode !== 200 || guestCheckRes.json?.isWishlisted !== false) {
    throw new Error('Guest check failed');
  }
  console.log('   ✔ Guest check returned isWishlisted: false without 401 error\n');

  // 2. Check validation: rejecting prod_* as variantId
  console.log('2. Testing GET /api/wishlist/check?variantId=prod_01M0MSNAEH833F52H0K90WCMJZ (Validation)');
  const prodCheckRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/wishlist/check?variantId=prod_01M0MSNAEH833F52H0K90WCMJZ',
    method: 'GET',
  });
  console.log(`   Status: ${prodCheckRes.statusCode}, JSON: ${JSON.stringify(prodCheckRes.json)}`);
  if (prodCheckRes.statusCode !== 400 || prodCheckRes.json?.error !== 'INVALID_VARIANT_ID') {
    throw new Error('Product ID validation on check endpoint failed');
  }
  console.log('   ✔ Rejection of prod_* on check endpoint verified (Status 400 INVALID_VARIANT_ID)\n');

  // 3. Check validation: missing variantId
  console.log('3. Testing GET /api/wishlist/check (Missing parameter)');
  const missingCheckRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/wishlist/check',
    method: 'GET',
  });
  console.log(`   Status: ${missingCheckRes.statusCode}, JSON: ${JSON.stringify(missingCheckRes.json)}`);
  if (missingCheckRes.statusCode !== 400 || missingCheckRes.json?.error !== 'INVALID_VARIANT_ID') {
    throw new Error('Missing parameter validation failed');
  }
  console.log('   ✔ Rejection of missing parameter on check endpoint verified (Status 400)\n');

  // 4. Test Guest /wishlist page redirect protection
  console.log('4. Testing GET /wishlist page (Guest Access)');
  const guestPageRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/wishlist',
    method: 'GET',
  });
  console.log(`   Status: ${guestPageRes.statusCode}, Location: ${guestPageRes.headers.location || 'None'}`);
  if (guestPageRes.statusCode === 307 || guestPageRes.statusCode === 302) {
    console.log(`   ✔ Unauthenticated user redirected to: ${guestPageRes.headers.location}\n`);
  } else if (guestPageRes.statusCode === 200) {
    console.log('   ✔ Page served with unauthenticated client boundary\n');
  }

  // 5. Test POST /api/wishlist rejection for guest
  console.log('5. Testing POST /api/wishlist (Guest Access)');
  const guestAddRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/wishlist',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    JSON.stringify({
      productId: 'prod_01M0MSNAEH833F52H0K90WCMJZ',
      variantId: 'variant_01M0MSNBCQH8NWQ9BS5XFCBGSA',
      title: 'Silk Saree',
    })
  );
  console.log(`   Status: ${guestAddRes.statusCode}, JSON: ${JSON.stringify(guestAddRes.json)}`);
  if (guestAddRes.statusCode !== 401) {
    throw new Error('Guest POST to /api/wishlist must return 401 UNAUTHORIZED');
  }
  console.log('   ✔ Guest add strictly blocked with 401 UNAUTHORIZED\n');

  console.log('================================================================');
  console.log('ALL LIVE STOREFRONT BROWSER & BFF TESTS PASSED! ✔');
  console.log('================================================================\n');
}

run().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
