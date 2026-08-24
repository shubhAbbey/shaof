const BASE_URL = 'http://localhost:9000';

const PUBLISHABLE_KEY = 'pk_962772bcd68f09b11833d76684644ae47e3f46059f995ff0c5eeba74d0cc01e3';

async function main() {
  console.log('--- 1. CREATE CART ---');
  const createRes = await fetch(`${BASE_URL}/store/carts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': PUBLISHABLE_KEY,
    },
    body: JSON.stringify({
      region_id: 'reg_01M0TQGWAZAMASWD0PJ70D461A',
    }),
  });

  console.log('CREATE Status:', createRes.status);
  const createData = await createRes.json();
  console.log('CREATE Data:', JSON.stringify(createData, null, 2));

  const cartId = createData.cart?.id;
  if (!cartId) {
    console.error('Failed to get cart ID!');
    return;
  }

  console.log('\n--- 2. GET CART (IMMEDIATELY) ---');
  const getRes = await fetch(`${BASE_URL}/store/carts/${cartId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': PUBLISHABLE_KEY,
    },
  });
  console.log('GET Status:', getRes.status);
  const getData = await getRes.json();
  console.log('GET Data:', JSON.stringify(getData, null, 2));

  console.log('\n--- 3. ADD LINE ITEM ---');
  const addRes = await fetch(`${BASE_URL}/store/carts/${cartId}/line-items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': PUBLISHABLE_KEY,
    },
    body: JSON.stringify({
      variant_id: 'variant_mt4ojin2_2b9d91bb142f',
      quantity: 2,
    }),
  });
  console.log('ADD Status:', addRes.status);
  const addData = await addRes.json();
  console.log('ADD Data:', JSON.stringify(addData, null, 2));

  console.log('\n--- 4. GET CART AFTER ADD ---');
  const getAfterRes = await fetch(`${BASE_URL}/store/carts/${cartId}?fields=*items,*items.variant`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': PUBLISHABLE_KEY,
    },
  });
  console.log('GET AFTER Status:', getAfterRes.status);
  const getAfterData = await getAfterRes.json();
  console.log('GET AFTER Data:', JSON.stringify(getAfterData, null, 2));
}

main().catch(console.error);
