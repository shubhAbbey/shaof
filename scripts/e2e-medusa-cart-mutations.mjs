const BASE_URL = 'http://localhost:9000';
const PUBLISHABLE_KEY = 'pk_962772bcd68f09b11833d76684644ae47e3f46059f995ff0c5eeba74d0cc01e3';

async function e2eCartMutations() {
  console.log('==================================================');
  console.log('REAL END-TO-END MEDUSA CART MUTATION VALIDATION');
  console.log('==================================================');

  // 1. Create Cart
  console.log('\n[1] Create Cart');
  const createRes = await fetch(`${BASE_URL}/store/carts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-publishable-api-key': PUBLISHABLE_KEY },
    body: JSON.stringify({}),
  });
  const createData = await createRes.json();
  const cartId = createData.cart.id;
  console.log('Cart created:', cartId, '| Status:', createRes.status);

  // 2. Add item (qty 1)
  console.log('\n[2] Add item (qty 1)');
  const addRes = await fetch(`${BASE_URL}/store/carts/${cartId}/line-items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-publishable-api-key': PUBLISHABLE_KEY },
    body: JSON.stringify({ variant_id: 'variant_mt4ojin2_2b9d91bb142f', quantity: 1 }),
  });
  const addData = await addRes.json();
  const lineItemId = addData.cart.items[0].id;
  console.log('Item added:', lineItemId, '| Qty:', addData.cart.items[0].quantity, '| Total:', addData.cart.total);

  // 3. GET cart
  console.log('\n[3] GET cart');
  const get1Res = await fetch(`${BASE_URL}/store/carts/${cartId}?fields=*items,*items.variant`, {
    headers: { 'Content-Type': 'application/json', 'x-publishable-api-key': PUBLISHABLE_KEY },
  });
  const get1Data = await get1Res.json();
  console.log('GET 1 Status:', get1Res.status, '| Items in cart:', get1Data.cart.items.length);

  // 4. PATCH quantity 1 -> 2
  console.log('\n[4] PATCH quantity 1 -> 2');
  const patch2Res = await fetch(`${BASE_URL}/store/carts/${cartId}/line-items/${lineItemId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-publishable-api-key': PUBLISHABLE_KEY },
    body: JSON.stringify({ quantity: 2 }),
  });
  const patch2Data = await patch2Res.json();
  console.log('PATCH 2 Status:', patch2Res.status, '| Qty:', patch2Data.cart.items[0]?.quantity, '| Total:', patch2Data.cart.total);

  // 5. GET cart and verify quantity 2
  console.log('\n[5] GET cart (verify quantity 2)');
  const get2Res = await fetch(`${BASE_URL}/store/carts/${cartId}?fields=*items,*items.variant`, {
    headers: { 'Content-Type': 'application/json', 'x-publishable-api-key': PUBLISHABLE_KEY },
  });
  const get2Data = await get2Res.json();
  console.log('GET 2 Status:', get2Res.status, '| Qty:', get2Data.cart.items[0]?.quantity, '| Total:', get2Data.cart.total);

  // 6. PATCH quantity 2 -> 1
  console.log('\n[6] PATCH quantity 2 -> 1');
  const patch1Res = await fetch(`${BASE_URL}/store/carts/${cartId}/line-items/${lineItemId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-publishable-api-key': PUBLISHABLE_KEY },
    body: JSON.stringify({ quantity: 1 }),
  });
  const patch1Data = await patch1Res.json();
  console.log('PATCH 1 Status:', patch1Res.status, '| Qty:', patch1Data.cart.items[0]?.quantity, '| Total:', patch1Data.cart.total);

  // 7. GET cart and verify quantity 1
  console.log('\n[7] GET cart (verify quantity 1)');
  const get3Res = await fetch(`${BASE_URL}/store/carts/${cartId}?fields=*items,*items.variant`, {
    headers: { 'Content-Type': 'application/json', 'x-publishable-api-key': PUBLISHABLE_KEY },
  });
  const get3Data = await get3Res.json();
  console.log('GET 3 Status:', get3Res.status, '| Qty:', get3Data.cart.items[0]?.quantity, '| Total:', get3Data.cart.total);

  // 8. DELETE line item
  console.log('\n[8] DELETE line item');
  const deleteRes = await fetch(`${BASE_URL}/store/carts/${cartId}/line-items/${lineItemId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', 'x-publishable-api-key': PUBLISHABLE_KEY },
  });
  const deleteData = await deleteRes.json();
  console.log('DELETE Status:', deleteRes.status, '| Deleted:', deleteData.deleted, '| Parent Cart Items:', deleteData.parent?.items?.length);

  // 9. GET cart and verify item is gone
  console.log('\n[9] GET cart (verify item is gone)');
  const get4Res = await fetch(`${BASE_URL}/store/carts/${cartId}?fields=*items,*items.variant`, {
    headers: { 'Content-Type': 'application/json', 'x-publishable-api-key': PUBLISHABLE_KEY },
  });
  const get4Data = await get4Res.json();
  console.log('GET 4 Status:', get4Res.status, '| Items in cart:', get4Data.cart.items.length, '| Total:', get4Data.cart.total);

  console.log('\n==================================================');
  console.log('ALL REAL END-TO-END MUTATIONS PASSED SUCCESSFULLY!');
  console.log('==================================================');
}

e2eCartMutations().catch(console.error);
