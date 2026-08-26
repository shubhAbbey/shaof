import { MedusaContainer } from '@medusajs/framework/types';
import { listShippingOptionsForCartWorkflow, addShippingMethodToCartWorkflow } from '@medusajs/medusa/core-flows';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';

export default async function verifyShippingWorkflow({ container }: { container: MedusaContainer }) {
  console.log('=== VERIFYING LIVE MEDUSA SHIPPING WORKFLOWS ===');
  const cartId = 'cart_01M0YFTV5JCVKWGRB0R6AD9JPK';
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  console.log(`\n--- 1. RUNNING listShippingOptionsForCartWorkflow for ${cartId} ---`);
  const { result: shippingOptions } = await listShippingOptionsForCartWorkflow(container).run({
    input: {
      cart_id: cartId,
    },
  });

  console.log('Discovered Shipping Options:', JSON.stringify(shippingOptions, null, 2));

  if (!shippingOptions || shippingOptions.length === 0) {
    console.error('No shipping options discovered!');
    return;
  }

  const selectedOption = shippingOptions[0];
  console.log(`\n--- 2. RUNNING addShippingMethodToCartWorkflow for option: ${selectedOption.name} (${selectedOption.id}) ---`);

  await addShippingMethodToCartWorkflow(container).run({
    input: {
      cart_id: cartId,
      options: [
        {
          id: selectedOption.id,
        },
      ],
    },
  });

  console.log('\n--- 3. QUERYING FINAL RECALCULATED CART ---');
  const { data: carts } = await query.graph({
    entity: 'cart',
    filters: { id: cartId },
    fields: [
      'id',
      'currency_code',
      'total',
      'subtotal',
      'shipping_total',
      'discount_total',
      'tax_total',
      'shipping_methods.*',
      'shipping_address.*',
    ],
  });

  const updatedCart = carts[0];
  console.log('Updated Cart with Attached Shipping Method:', JSON.stringify(updatedCart, null, 2));
  console.log('\n=== VERIFICATION SUCCESSFUL ===');
}
