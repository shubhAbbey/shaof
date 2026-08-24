const BASE_URL = 'http://localhost:9000';
const PUBLISHABLE_KEY = 'pk_962772bcd68f09b11833d76684644ae47e3f46059f995ff0c5eeba74d0cc01e3';

async function main() {
  console.log('--- 1. Create Real Cart ---');
  const createRes = await fetch(`${BASE_URL}/store/carts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-publishable-api-key': PUBLISHABLE_KEY },
    body: JSON.stringify({}),
  });
  const createData = await createRes.json();
  const cartId = createData.cart.id;
  console.log('Cart ID:', cartId);

  console.log('\n--- 2. Add Line Item ---');
  const addRes = await fetch(`${BASE_URL}/store/carts/${cartId}/line-items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-publishable-api-key': PUBLISHABLE_KEY },
    body: JSON.stringify({ variant_id: 'variant_mt4ojin2_2b9d91bb142f', quantity: 1 }),
  });
  const addData = await addRes.json();
  const lineItemId = addData.cart.items[0].id;
  console.log('Line Item ID:', lineItemId);

  console.log('\n--- 3. Direct Live Medusa UPDATE (POST qty 2) ---');
  const updateRes = await fetch(`${BASE_URL}/store/carts/${cartId}/line-items/${lineItemId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-publishable-api-key': PUBLISHABLE_KEY },
    body: JSON.stringify({ quantity: 2 }),
  });
  console.log('Update Status:', updateRes.status);
  const updateData = await updateRes.json();
  console.log('Update Response Keys:', Object.keys(updateData));
  console.log('Update Data:', JSON.stringify(updateData, null, 2));

  console.log('\n--- 4. Direct Live Medusa DELETE ---');
  const deleteRes = await fetch(`${BASE_URL}/store/carts/${cartId}/line-items/${lineItemId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', 'x-publishable-api-key': PUBLISHABLE_KEY },
  });
  console.log('Delete Status:', deleteRes.status);
  const deleteData = await deleteRes.json();
  console.log('Delete Response Keys:', Object.keys(deleteData));
  console.log('Delete Data:', JSON.stringify(deleteData, null, 2));

  console.log('\n--- 5. GET Cart After Delete ---');
  const getAfterRes = await fetch(`${BASE_URL}/store/carts/${cartId}?fields=*items,*items.variant`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', 'x-publishable-api-key': PUBLISHABLE_KEY },
  });
  console.log('GET After Status:', getAfterRes.status);
  const getAfterData = await getAfterRes.json();
  console.log('Items Count After Delete:', getAfterData.cart?.items?.length);
  console.log('GET After Data:', JSON.stringify(getAfterData, null, 2));
}

main().catch(console.error);
