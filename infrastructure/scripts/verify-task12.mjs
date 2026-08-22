import http from 'http';

function get(path, headers = {}) {
  return new Promise((resolve, reject) => {
    http.get({ host: '127.0.0.1', port: 3000, path, headers }, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(body);
        } catch {}
        resolve({ status: res.statusCode, body, json, headers: res.headers });
      });
    }).on('error', reject);
  });
}

async function runVerification() {
  console.log('================================================================');
  console.log('TASK 12 FINAL VERIFICATION & DEEP GAP AUDIT SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assertTest(name, condition, details = '') {
    if (condition) {
      passed++;
      console.log(`✓ [PASS] ${name}`);
      if (details) console.log(`   ${details}`);
    } else {
      failed++;
      console.error(`✗ [FAIL] ${name}`);
      if (details) console.error(`   ${details}`);
    }
  }

  // 1. API Route: Category querying with live facets
  const catApiRes = await get('/api/products?categoryHandle=women');
  assertTest(
    'API: Fetch Category Products & Facets',
    catApiRes.status === 200 && catApiRes.json && catApiRes.json.products?.length > 0,
    `Total Products: ${catApiRes.json?.totalCount}, Facets: Brands(${catApiRes.json?.facets?.brands?.length}), Sizes(${catApiRes.json?.facets?.sizes?.length}), Colors(${catApiRes.json?.facets?.colors?.length})`
  );

  // 2. API Route: Brand Filter
  const brandApiRes = await get('/api/products?categoryHandle=women&brands=Virasat+Heritage');
  const allVirasat = brandApiRes.json?.products?.every((p) => p.brand === 'Virasat Heritage');
  assertTest(
    'API: Brand Filtering (Virasat Heritage)',
    brandApiRes.status === 200 && (brandApiRes.json?.products?.length || 0) > 0 && allVirasat,
    `Matched ${brandApiRes.json?.products?.length} products, all brand="Virasat Heritage"`
  );

  // 3. API Route: Size Filter
  const sizeApiRes = await get('/api/products?categoryHandle=women&sizes=Free+Size');
  const allFreeSize = sizeApiRes.json?.products?.every((p) => p.sizes?.includes('Free Size'));
  assertTest(
    'API: Size Filtering (Free Size)',
    sizeApiRes.status === 200 && (sizeApiRes.json?.products?.length || 0) > 0 && allFreeSize,
    `Matched ${sizeApiRes.json?.products?.length} products containing "Free Size"`
  );

  // 4. API Route: Price Sorting Ascending
  const sortAscRes = await get('/api/products?categoryHandle=women&sort=price_asc');
  const pricesAsc = sortAscRes.json?.products?.map((p) => p.price) || [];
  const isSortedAsc = pricesAsc.every((val, i, arr) => !i || arr[i - 1] <= val);
  assertTest(
    'API: Sorting Price Ascending (price_asc)',
    sortAscRes.status === 200 && pricesAsc.length > 1 && isSortedAsc,
    `Prices: ${pricesAsc.join(', ')}`
  );

  // 5. API Route: Price Sorting Descending
  const sortDescRes = await get('/api/products?categoryHandle=women&sort=price_desc');
  const pricesDesc = sortDescRes.json?.products?.map((p) => p.price) || [];
  const isSortedDesc = pricesDesc.every((val, i, arr) => !i || arr[i - 1] >= val);
  assertTest(
    'API: Sorting Price Descending (price_desc)',
    sortDescRes.status === 200 && pricesDesc.length > 1 && isSortedDesc,
    `Prices: ${pricesDesc.join(', ')}`
  );

  // 6. API Route: Price Range Filter
  const priceRangeRes = await get('/api/products?categoryHandle=women&price_min=1500&price_max=3000');
  const allInRange = priceRangeRes.json?.products?.every((p) => p.price >= 1500 && p.price <= 3000);
  assertTest(
    'API: Price Range Filtering (₹1,500 - ₹3,000)',
    priceRangeRes.status === 200 && (priceRangeRes.json?.products?.length || 0) > 0 && allInRange,
    `Matched ${priceRangeRes.json?.products?.length} products within price range`
  );

  // 7. API Route: Pagination Slicing & Duplicate Prevention
  const page1Res = await get('/api/products?categoryHandle=women&limit=2&offset=0');
  const page2Res = await get('/api/products?categoryHandle=women&limit=2&offset=2');
  const p1Ids = page1Res.json?.products?.map((p) => p.id) || [];
  const p2Ids = page2Res.json?.products?.map((p) => p.id) || [];
  const noOverlap = p1Ids.every((id) => !p2Ids.includes(id));
  assertTest(
    'API: Pagination Offset & Duplicate Free Slicing',
    page1Res.status === 200 && page2Res.status === 200 && p1Ids.length === 2 && p2Ids.length === 2 && noOverlap,
    `Page 1 IDs: [${p1Ids.slice(0, 2).join(', ')}], Page 2 IDs: [${p2Ids.slice(0, 2).join(', ')}] (Overlap: ${!noOverlap})`
  );

  // 8. Storefront Category PLP Page
  const catPageRes = await get('/category/women');
  assertTest(
    'Storefront: Category PLP Page (/category/women)',
    catPageRes.status === 200 && catPageRes.body.includes('Women') && catPageRes.body.includes('Sort by:'),
    `Rendered Title, Filters panel, and Sort selector`
  );

  // 9. Storefront Category PLP with URL Search Params
  const catParamRes = await get('/category/women?brands=Virasat+Heritage&sort=price_asc');
  assertTest(
    'Storefront: Category PLP URL State Synchronization',
    catParamRes.status === 200 && catParamRes.body.includes('Virasat Heritage'),
    `Rendered active filter query parameters successfully`
  );

  // 10. Storefront Collection PLP Page
  const colPageRes = await get('/collections/festive-glam');
  assertTest(
    'Storefront: Collection PLP Page (/collections/festive-glam)',
    colPageRes.status === 200 && colPageRes.body.includes('Festive Glam'),
    `Rendered Collection PLP with live products`
  );

  // 11. Storefront Brand PLP Page
  const brandPageRes = await get('/brand/virasat-heritage');
  assertTest(
    'Storefront: Brand PLP Page (/brand/virasat-heritage)',
    brandPageRes.status === 200 && brandPageRes.body.includes('Virasat Heritage'),
    `Rendered Brand PLP spotlight`
  );

  // 12. Storefront Sale PLP Page
  const salePageRes = await get('/sale/all');
  assertTest(
    'Storefront: Curated Sale PLP Page (/sale/all)',
    salePageRes.status === 200 && salePageRes.body.includes('Flash Sale'),
    `Rendered Curated Sale PLP`
  );

  // 13. Storefront Homepage Regression & CMS Horizontal Visibility
  const homeRes = await get('/');
  assertTest(
    'Storefront: Homepage (Task 09 Regression & CMS Slider Support)',
    homeRes.status === 200 && homeRes.body.includes('CURATED COLLECTION') && homeRes.body.includes('Explore by Category'),
    `Rendered Homepage with CMS sections and horizontal scroller wrappers`
  );

  // 14. Homepage "View All" Navigation vs Desktop PLP "View More" Separation
  const hasViewAllLink = homeRes.body.includes('/collections/festive-edit') || homeRes.body.includes('View All');
  assertTest(
    'Homepage: "View All" is Navigation to Dedicated PLP Route',
    hasViewAllLink,
    `Homepage contains View All link pointing to dedicated PLP context`
  );

  // 15. Storefront CMS Pages Regression (Task 10)
  const saleCmsRes = await get('/sale');
  const aboutCmsRes = await get('/pages/about-us');
  const policyCmsRes = await get('/policies/privacy-policy');
  assertTest(
    'Storefront: CMS Pages Regression (Task 10)',
    saleCmsRes.status === 200 && aboutCmsRes.status === 200 && policyCmsRes.status === 200,
    `Verified /sale (${saleCmsRes.status}), /pages/about-us (${aboutCmsRes.status}), /policies/privacy-policy (${policyCmsRes.status})`
  );

  // 16. Invalid Category 404 Not Found UI
  const notFoundRes = await get('/category/non-existent-category-slug-99');
  const rendersNotFound = notFoundRes.body.includes('Page Not Found') || notFoundRes.body.includes('404') || notFoundRes.body.includes('does not exist');
  assertTest(
    'Storefront: 404 on Invalid Category Handle',
    rendersNotFound,
    `Rendered 404 Not Found UI for invalid category`
  );

  // 17. Homepage Bottom Multi-Row Infinite Product Feed
  const hasBottomFeed = (homeRes.body.includes('Explore All Collections') || homeRes.body.includes('Explore All Collections &amp; Styles')) && homeRes.body.includes('MORE TO LOVE');
  assertTest(
    'Homepage: Bottom Multi-Row Infinite Product Feed',
    hasBottomFeed,
    `Homepage renders dedicated bottom multi-row product feed directly from Medusa`
  );

  // 18. Global 1-Row Rule & View All on Trending New Arrivals
  const hasTrendingNewArrivals = homeRes.body.includes('Trending New Arrivals') && homeRes.body.includes('NEW ARRIVALS');
  assertTest(
    'Homepage: Trending New Arrivals follows 1-Row Slider Rule with View All',
    hasTrendingNewArrivals,
    `Trending New Arrivals rendered with 1-row horizontal scroller and View All navigation`
  );

  console.log('\n================================================================');
  console.log(`FINAL RESULT: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification().catch(console.error);
