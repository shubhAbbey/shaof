import assert from 'node:assert';

const BASE_URL = 'http://localhost:9000';
const PUBLISHABLE_KEY = 'pk_962772bcd68f09b11833d76684644ae47e3f46059f995ff0c5eeba74d0cc01e3';

async function main() {
  console.log('==================================================');
  console.log('REAL LIVE MEDUSA CART MERGE END-TO-END VALIDATION');
  console.log('==================================================');

  // 1. Get available products/variants from Medusa
  const prodRes = await fetch(`${BASE_URL}/store/products`, {
    headers: { 'x-publishable-api-key': PUBLISHABLE_KEY },
  });
  const prodData = await prodRes.json();
  const variants = [];
  for (const prod of prodData.products || []) {
    for (const v of prod.variants || []) {
      variants.push({ id: v.id, title: v.title, productTitle: prod.title });
    }
  }
  console.log(`[1] Found ${variants.length} available variants from live Medusa`);
  assert.ok(variants.length >= 2, 'Need at least 2 variants for merge testing');
  const variantA = variants[0];
  const variantB = variants[1];
  console.log(`Variant A: ${variantA.id} (${variantA.productTitle} - ${variantA.title})`);
  console.log(`Variant B: ${variantB.id} (${variantB.productTitle} - ${variantB.title})`);

  // 2. Create Customer Cart with Variant A (Qty: 2)
  console.log('\n[2] Create Customer Cart');
  const custCartRes = await fetch(`${BASE_URL}/store/carts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-publishable-api-key': PUBLISHABLE_KEY },
    body: JSON.stringify({}),
  });
  const custCartData = await custCartRes.json();
  const custCartId = custCartData.cart.id;
  console.log('Customer Cart created:', custCartId);

  const addCustRes = await fetch(`${BASE_URL}/store/carts/${custCartId}/line-items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-publishable-api-key': PUBLISHABLE_KEY },
    body: JSON.stringify({ variant_id: variantA.id, quantity: 2 }),
  });
  const addCustData = await addCustRes.json();
  console.log('Added Variant A (Qty 2) to Customer Cart. Status:', addCustRes.status);
  assert.equal(addCustData.cart.items.length, 1);
  assert.equal(addCustData.cart.items[0].quantity, 2);

  // 3. Create Guest Cart with Variant A (Qty: 1) and Variant B (Qty: 2)
  console.log('\n[3] Create Guest Cart');
  const guestCartRes = await fetch(`${BASE_URL}/store/carts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-publishable-api-key': PUBLISHABLE_KEY },
    body: JSON.stringify({}),
  });
  const guestCartData = await guestCartRes.json();
  const guestCartId = guestCartData.cart.id;
  console.log('Guest Cart created:', guestCartId);

  // Add duplicate Variant A (Qty 1) to Guest Cart
  const addGuestARes = await fetch(`${BASE_URL}/store/carts/${guestCartId}/line-items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-publishable-api-key': PUBLISHABLE_KEY },
    body: JSON.stringify({ variant_id: variantA.id, quantity: 1 }),
  });
  console.log('Added Variant A (Qty 1) to Guest Cart. Status:', addGuestARes.status);

  // Add distinct Variant B (Qty 2) to Guest Cart
  const addGuestBRes = await fetch(`${BASE_URL}/store/carts/${guestCartId}/line-items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-publishable-api-key': PUBLISHABLE_KEY },
    body: JSON.stringify({ variant_id: variantB.id, quantity: 2 }),
  });
  console.log('Added Variant B (Qty 2) to Guest Cart. Status:', addGuestBRes.status);

  // 4. Fetch Guest Cart state before merge
  const guestGetRes = await fetch(`${BASE_URL}/store/carts/${guestCartId}?fields=*items,*items.variant`, {
    headers: { 'x-publishable-api-key': PUBLISHABLE_KEY },
  });
  const guestGetData = await guestGetRes.json();
  console.log(`Guest Cart items before merge: ${guestGetData.cart.items.length} items`);
  assert.equal(guestGetData.cart.items.length, 2);

  // 5. Execute Merge Sequence into Customer Cart
  console.log('\n[4] Execute Merge Sequence: Duplicate Variant A (2+1=3), Distinct Variant B (+2)');
  // A. Duplicate Variant A -> update quantity 2 -> 3
  const custItemA = addCustData.cart.items.find(i => i.variant_id === variantA.id);
  const updateARes = await fetch(`${BASE_URL}/store/carts/${custCartId}/line-items/${custItemA.id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-publishable-api-key': PUBLISHABLE_KEY },
    body: JSON.stringify({ quantity: 3 }),
  });
  console.log('Updated Variant A to Qty 3 on Customer Cart. Status:', updateARes.status);

  // B. Distinct Variant B -> add to Customer Cart
  const addBRes = await fetch(`${BASE_URL}/store/carts/${custCartId}/line-items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-publishable-api-key': PUBLISHABLE_KEY },
    body: JSON.stringify({ variant_id: variantB.id, quantity: 2 }),
  });
  console.log('Added Variant B (Qty 2) to Customer Cart. Status:', addBRes.status);

  // C. Delete merged items from Guest Cart
  for (const gItem of guestGetData.cart.items) {
    const delRes = await fetch(`${BASE_URL}/store/carts/${guestCartId}/line-items/${gItem.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-publishable-api-key': PUBLISHABLE_KEY },
    });
    console.log(`Deleted guest line item ${gItem.id} from Guest Cart. Status:`, delRes.status);
  }

  // D. Attach customer email to Customer Cart
  const updateCustRes = await fetch(`${BASE_URL}/store/carts/${custCartId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-publishable-api-key': PUBLISHABLE_KEY },
    body: JSON.stringify({ email: 'live.customer@example.com' }),
  });
  console.log('Attached customer email to Customer Cart. Status:', updateCustRes.status);

  // 6. Verify Final Authoritative Medusa Customer Cart
  console.log('\n[5] Verify Final Merged Customer Cart State from Medusa');
  const finalCustRes = await fetch(`${BASE_URL}/store/carts/${custCartId}?fields=*items,*items.variant`, {
    headers: { 'x-publishable-api-key': PUBLISHABLE_KEY },
  });
  const finalCustData = await finalCustRes.json();
  const finalCart = finalCustData.cart;

  console.log('Customer Cart Email:', finalCart.email);
  console.log('Customer Cart Total Items:', finalCart.items.reduce((s, i) => s + i.quantity, 0));
  console.log('Customer Cart Subtotal:', finalCart.subtotal);
  console.log('Customer Cart Total:', finalCart.total);
  console.log('Line Items:');
  for (const item of finalCart.items) {
    console.log(` - ${item.title || item.variant_id} | Qty: ${item.quantity} | UnitPrice: ${item.unit_price} | Total: ${item.total}`);
  }

  assert.equal(finalCart.email, 'live.customer@example.com');
  assert.equal(finalCart.items.length, 2);
  const finalItemA = finalCart.items.find(i => i.variant_id === variantA.id);
  const finalItemB = finalCart.items.find(i => i.variant_id === variantB.id);
  assert.ok(finalItemA);
  assert.equal(finalItemA.quantity, 3); // 2 customer + 1 guest
  assert.ok(finalItemB);
  assert.equal(finalItemB.quantity, 2); // 2 guest
  assert.ok(finalCart.total > 0);

  // 7. Verify Guest Cart is Cleaned Up
  console.log('\n[6] Verify Guest Cart is Cleaned Up');
  const finalGuestRes = await fetch(`${BASE_URL}/store/carts/${guestCartId}?fields=*items`, {
    headers: { 'x-publishable-api-key': PUBLISHABLE_KEY },
  });
  const finalGuestData = await finalGuestRes.json();
  console.log('Guest Cart remaining items:', finalGuestData.cart.items.length);
  assert.equal(finalGuestData.cart.items.length, 0);

  console.log('\n==================================================');
  console.log('>>> ALL LIVE MEDUSA CART MERGE E2E TESTS PASSED <<<');
  console.log('==================================================');
}

main().catch(err => {
  console.error('E2E Cart Merge Failed:', err);
  process.exit(1);
});
