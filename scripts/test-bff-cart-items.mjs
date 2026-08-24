const MEDUSA_URL = 'http://localhost:9000';
const PUBLISHABLE_KEY = 'pk_962772bcd68f09b11833d76684644ae47e3f46059f995ff0c5eeba74d0cc01e3';

async function testGuestAddToCart() {
  console.log('--- 1. POST /store/carts (Payload: {}) ---');
  const createRes = await fetch(`${MEDUSA_URL}/store/carts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': PUBLISHABLE_KEY,
    },
    body: JSON.stringify({}),
  });

  console.log('Create HTTP Status:', createRes.status);
  const createData = await createRes.json();
  const cartId = createData.cart?.id;
  console.log('Created Real Cart ID:', cartId);
  console.log('Cart Currency:', createData.cart?.currency_code);
  console.log('Cart Region ID:', createData.cart?.region_id);

  console.log('\n--- 2. POST /store/carts/:id/line-items (Add Item) ---');
  const addRes = await fetch(`${MEDUSA_URL}/store/carts/${cartId}/line-items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': PUBLISHABLE_KEY,
    },
    body: JSON.stringify({
      variant_id: 'variant_mt4ojin2_2b9d91bb142f',
      quantity: 1,
    }),
  });

  console.log('Add HTTP Status:', addRes.status);
  const addData = await addRes.json();
  console.log('Items in Cart:', addData.cart?.items?.length);
  console.log('Added Item Title:', addData.cart?.items?.[0]?.title);
  console.log('Item Quantity:', addData.cart?.items?.[0]?.quantity);
  console.log('Item Unit Price:', addData.cart?.items?.[0]?.unit_price);
  console.log('Cart Grand Total:', addData.cart?.total);
}

testGuestAddToCart().catch(console.error);
