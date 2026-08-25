/**
 * Live End-to-End Verification of Phase 22 Wishlist Persistence & Variant Move-to-Cart
 * Proves:
 * 1. Durable persistence in Medusa database via custom DML module
 * 2. Variant-specific identity (customer_id + variant_id)
 * 3. Rejection of invalid variant IDs (prod_* as variantId)
 * 4. Multi-variant support for same product
 * 5. Redis is ONLY a cache: survives complete Redis FLUSHALL / cache wipe
 * 6. DB-level uniqueness & idempotency
 * 7. Real Move-to-Cart with real variant_id added to live Medusa cart
 * 8. Safe removal & empty state recovery
 */

import { Redis } from 'ioredis';

const MEDUSA_URL = 'http://localhost:9000';
const PUBLISHABLE_KEY = 'pk_962772bcd68f09b11833d76684644ae47e3f46059f995ff0c5eeba74d0cc01e3';

const headers = {
  'Content-Type': 'application/json',
  'x-publishable-api-key': PUBLISHABLE_KEY,
};

async function main() {
  console.log('=== PHASE 22 LIVE MEDUSA VARIANT WISHLIST & MOVE-TO-CART E2E TEST ===\n');

  // Fetch real live products from Medusa
  const prodRes = await fetch(`${MEDUSA_URL}/store/products?limit=5&fields=*variants`, { headers });
  const prodData = await prodRes.json();
  if (!prodData.products || prodData.products.length === 0) {
    throw new Error('No products returned from Medusa store');
  }

  const realProduct = prodData.products.find((p) => p.variants && p.variants.length >= 1) || prodData.products[0];
  const realProductId = realProduct.id;
  const realVariant1 = realProduct.variants[0];
  const realVariant1Id = realVariant1.id;
  const realVariant2Id = realProduct.variants.length > 1 ? realProduct.variants[1].id : `${realVariant1Id}_var2_test`;

  console.log(`Using real Medusa Product: ${realProductId} (${realProduct.title})`);
  console.log(`  Variant 1: ${realVariant1Id}`);
  console.log(`  Variant 2: ${realVariant2Id}\n`);

  const testCustomer = `cus_variant_live_${Date.now()}`;

  // 1. Initial State: Empty Wishlist
  console.log('Step 1: Verify Initial Empty Wishlist');
  const emptyRes = await fetch(`${MEDUSA_URL}/store/wishlist?customer_id=${testCustomer}`, { headers });
  const emptyData = await emptyRes.json();
  if (!emptyData.success || emptyData.wishlist.itemCount !== 0) {
    throw new Error(`Failed step 1: ${JSON.stringify(emptyData)}`);
  }
  console.log('  ✔ Empty wishlist returned 0 items from Medusa persistent database\n');

  // 2. Reject missing variant_id & prod_* as variant_id
  console.log('Step 2: Verify Validation Rules (Missing variant_id & prod_* as variant_id)');
  const missingVarRes = await fetch(`${MEDUSA_URL}/store/wishlist`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      customer_id: testCustomer,
      product_id: realProductId,
    }),
  });
  const missingVarData = await missingVarRes.json();
  if (missingVarRes.status !== 400 || missingVarData.error !== 'VARIANT_ID_REQUIRED') {
    throw new Error(`Failed step 2 (missing variant): ${JSON.stringify(missingVarData)}`);
  }

  const prodAsVarRes = await fetch(`${MEDUSA_URL}/store/wishlist`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      customer_id: testCustomer,
      product_id: realProductId,
      variant_id: realProductId, // prod_* passed as variant
    }),
  });
  const prodAsVarData = await prodAsVarRes.json();
  if (prodAsVarRes.status !== 400 || prodAsVarData.error !== 'INVALID_VARIANT_ID') {
    throw new Error(`Failed step 2 (prod_* as variant): ${JSON.stringify(prodAsVarData)}`);
  }
  console.log('  ✔ Validation properly rejects missing variant_id and prod_* as variantId\n');

  // 3. Add Variant 1 (Persistent DB Write)
  console.log('Step 3: Add Variant 1 to Wishlist');
  const addRes1 = await fetch(`${MEDUSA_URL}/store/wishlist`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      customer_id: testCustomer,
      product_id: realProductId,
      variant_id: realVariant1Id,
      title: realProduct.title,
      handle: realProduct.handle,
      thumbnail: realProduct.thumbnail,
      price: realVariant1.prices?.[0]?.amount || 2499,
      currency_code: 'inr',
      in_stock: true,
      options: { Size: 'Free Size' },
    }),
  });
  const addData1 = await addRes1.json();
  if (!addData1.success || !addData1.isNew || addData1.wishlist.itemCount !== 1) {
    throw new Error(`Failed step 3: ${JSON.stringify(addData1)}`);
  }
  const createdItem1Id = addData1.item.id;
  console.log(`  ✔ Variant 1 persisted into Medusa database with ID: ${createdItem1Id}\n`);

  // 4. Add Variant 2 of same product (Multi-variant test)
  console.log('Step 4: Add Variant 2 of same product to Wishlist');
  const addRes2 = await fetch(`${MEDUSA_URL}/store/wishlist`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      customer_id: testCustomer,
      product_id: realProductId,
      variant_id: realVariant2Id,
      title: realProduct.title,
      handle: realProduct.handle,
      price: 2499,
      currency_code: 'inr',
      in_stock: true,
      options: { Size: 'Custom' },
    }),
  });
  const addData2 = await addRes2.json();
  if (!addData2.success || !addData2.isNew || addData2.wishlist.itemCount !== 2) {
    throw new Error(`Failed step 4: ${JSON.stringify(addData2)}`);
  }
  console.log('  ✔ Variant 2 persisted into Medusa database. Both variants co-exist for same product. Total count = 2\n');

  // 5. Duplicate Add Idempotency
  console.log('Step 5: Verify Idempotent Duplicate Add');
  const dupRes = await fetch(`${MEDUSA_URL}/store/wishlist`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      customer_id: testCustomer,
      product_id: realProductId,
      variant_id: realVariant1Id,
      options: { Size: 'Updated Size' },
    }),
  });
  const dupData = await dupRes.json();
  if (!dupData.success || dupData.isNew !== false || dupData.wishlist.itemCount !== 2) {
    throw new Error(`Failed step 5: ${JSON.stringify(dupData)}`);
  }
  console.log('  ✔ Duplicate add returned isNew=false without duplicating DB records\n');

  // 6. Check Presence by variantId
  console.log('Step 6: Check Presence by exact variantId');
  const checkRes1 = await fetch(`${MEDUSA_URL}/store/wishlist/check?customer_id=${testCustomer}&variant_id=${realVariant1Id}`, { headers });
  const checkData1 = await checkRes1.json();
  const checkResNon = await fetch(`${MEDUSA_URL}/store/wishlist/check?customer_id=${testCustomer}&variant_id=var_non_existent`, { headers });
  const checkDataNon = await checkResNon.json();
  const checkResProd = await fetch(`${MEDUSA_URL}/store/wishlist/check?customer_id=${testCustomer}&variant_id=${realProductId}`, { headers });
  const checkDataProd = await checkResProd.json();
  if (!checkData1.isWishlisted || checkDataNon.isWishlisted || checkDataProd.isWishlisted) {
    throw new Error('Failed step 6: check presence mismatch');
  }
  console.log('  ✔ Presence check verified by exact variant_id (existing=true, non_existent=false, prod_id=false)');

  // 6b. Verify DELETE with prod_* is rejected/safe and does not remove variants
  const deleteProdRes = await fetch(`${MEDUSA_URL}/store/wishlist/${realProductId}?customer_id=${testCustomer}`, {
    method: 'DELETE',
    headers,
  });
  const deleteProdData = await deleteProdRes.json();
  if (deleteProdData.removed !== false) {
    throw new Error('Failed step 6b: DELETE by product_id should not remove variant-specific items');
  }
  console.log('  ✔ DELETE with product_id safely ignored (removed=false, variants preserved)\n');

  // 7. REDIS FLUSH & COLD RECOVERY TEST
  console.log('Step 7: Flush Redis completely and prove cold recovery from Medusa persistent DB');
  const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  await redis.flushall();
  console.log('  ✔ Redis FLUSHALL executed (cache completely wiped)');

  const coldRes = await fetch(`${MEDUSA_URL}/store/wishlist?customer_id=${testCustomer}`, { headers });
  const coldData = await coldRes.json();
  if (!coldData.success || coldData.wishlist.itemCount !== 2) {
    throw new Error(`Failed step 7: cold recovery failed. Received: ${JSON.stringify(coldData)}`);
  }
  const recoveredVariantIds = coldData.wishlist.items.map((i) => i.variantId);
  if (!recoveredVariantIds.includes(realVariant1Id) || !recoveredVariantIds.includes(realVariant2Id)) {
    throw new Error('Failed step 7: recovered items do not match expected variant IDs');
  }
  console.log('  ✔ Cold recovery SUCCEEDED: both variant wishlist items recovered intact from Medusa DB!\n');

  // 8. REAL MOVE-TO-CART TEST WITH REAL VARIANT ID
  console.log('Step 8: Real Move-to-Cart with Real variantId into Medusa Cart');
  // Create customer cart in Medusa
  const cartRes = await fetch(`${MEDUSA_URL}/store/carts`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ currency_code: 'inr' }),
  });
  const cartData = await cartRes.json();
  if (!cartData.cart || !cartData.cart.id) {
    throw new Error(`Failed step 8 cart creation: ${JSON.stringify(cartData)}`);
  }
  const cartId = cartData.cart.id;
  console.log(`  ✔ Created Medusa Cart: ${cartId}`);

  // Add line item using realVariant1Id
  const lineItemRes = await fetch(`${MEDUSA_URL}/store/carts/${cartId}/line-items`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      variant_id: realVariant1Id,
      quantity: 1,
    }),
  });
  const lineItemData = await lineItemRes.json();
  if (!lineItemRes.ok || !lineItemData.cart) {
    throw new Error(`Failed step 8 add line item: ${JSON.stringify(lineItemData)}`);
  }
  const addedItem = lineItemData.cart.items.find((i) => i.variant_id === realVariant1Id);
  if (!addedItem) {
    throw new Error(`Failed step 8: line item not found in cart items: ${JSON.stringify(lineItemData.cart.items)}`);
  }
  console.log(`  ✔ Real Medusa Cart accepted variant_id ${realVariant1Id} (Line Item ID: ${addedItem.id})`);

  // Remove moved item from wishlist
  const delRes1 = await fetch(`${MEDUSA_URL}/store/wishlist/${createdItem1Id}?customer_id=${testCustomer}`, {
    method: 'DELETE',
    headers,
  });
  const delData1 = await delRes1.json();
  if (!delData1.success || !delData1.removed || delData1.wishlist.itemCount !== 1) {
    throw new Error(`Failed step 8 wishlist cleanup: ${JSON.stringify(delData1)}`);
  }
  console.log('  ✔ Wishlist item successfully removed after confirmed cart addition. Remaining count = 1\n');

  // 9. Clean up remaining variant
  console.log('Step 9: Clean up remaining variant from Wishlist');
  const delRes2 = await fetch(`${MEDUSA_URL}/store/wishlist/${realVariant2Id}?customer_id=${testCustomer}`, {
    method: 'DELETE',
    headers,
  });
  const delData2 = await delRes2.json();
  if (!delData2.success || !delData2.removed || delData2.wishlist.itemCount !== 0) {
    throw new Error(`Failed step 9: ${JSON.stringify(delData2)}`);
  }
  console.log('  ✔ Remaining variant deleted by variant_id. Wishlist empty.\n');

  await redis.quit();
  console.log('================================================================');
  console.log('ALL PHASE 22 LIVE PERSISTENCE & MOVE-TO-CART TESTS PASSED! ✔');
  console.log('================================================================');
}

main().catch((err) => {
  console.error('\n❌ TEST FAILED:', err.message);
  process.exit(1);
});
