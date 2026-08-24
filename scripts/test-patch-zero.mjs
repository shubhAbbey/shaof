const BASE_URL = 'http://localhost:9000';
const PUBLISHABLE_KEY = 'pk_962772bcd68f09b11833d76684644ae47e3f46059f995ff0c5eeba74d0cc01e3';

async function testPatchZero() {
  const createRes = await fetch(`${BASE_URL}/store/carts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-publishable-api-key': PUBLISHABLE_KEY },
    body: JSON.stringify({}),
  });
  const { cart } = await createRes.json();

  const addRes = await fetch(`${BASE_URL}/store/carts/${cart.id}/line-items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-publishable-api-key': PUBLISHABLE_KEY },
    body: JSON.stringify({ variant_id: 'variant_mt4ojin2_2b9d91bb142f', quantity: 1 }),
  });
  const addData = await addRes.json();
  const lineItemId = addData.cart.items[0].id;

  const updateZeroRes = await fetch(`${BASE_URL}/store/carts/${cart.id}/line-items/${lineItemId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-publishable-api-key': PUBLISHABLE_KEY },
    body: JSON.stringify({ quantity: 0 }),
  });

  console.log('Update Zero Status:', updateZeroRes.status);
  const updateZeroData = await updateZeroRes.json();
  console.log('Update Zero Data:', JSON.stringify(updateZeroData, null, 2));
}

testPatchZero().catch(console.error);
