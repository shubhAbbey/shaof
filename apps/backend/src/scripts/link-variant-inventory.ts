import { MedusaContainer } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';
import { createInventoryItemsWorkflow } from '@medusajs/medusa/core-flows';

export default async function linkVariantInventory({ container }: { container: MedusaContainer }) {
  console.log('Linking Product Variants to Inventory Items & Stock Locations...');
  const productModule = container.resolve(Modules.PRODUCT);
  const inventoryModule = container.resolve(Modules.INVENTORY);
  const stockLocationModule = container.resolve(Modules.STOCK_LOCATION);
  const remoteLink = container.resolve('remoteLink');

  const [locations] = await stockLocationModule.listAndCountStockLocations({});
  const defaultLocation = locations[0];
  if (!defaultLocation) {
    console.error('No stock location found!');
    return;
  }
  console.log('Using Stock Location:', defaultLocation.id, defaultLocation.name);

  const [products] = await productModule.listAndCountProducts({}, { relations: ['variants'] });
  console.log(`Found ${products.length} products to process`);

  for (const product of products) {
    for (const variant of product.variants || []) {
      const sku = variant.sku || `SKU-${variant.id}`;
      // Find or create inventory item for this variant
      let [items] = await inventoryModule.listAndCountInventoryItems({ sku });
      let item = items[0];

      if (!item) {
        console.log(`Creating inventory item for variant ${variant.id} (${sku})...`);
        const { result } = await createInventoryItemsWorkflow(container).run({
          input: {
            items: [
              {
                sku,
                title: variant.title,
                location_levels: [
                  {
                    location_id: defaultLocation.id,
                    stocked_quantity: 100,
                  },
                ],
              },
            ],
          },
        });
        item = result[0];
      }

      if (item) {
        try {
          await remoteLink.create([
            {
              [Modules.PRODUCT]: {
                variant_id: variant.id,
              },
              [Modules.INVENTORY]: {
                inventory_item_id: item.id,
              },
            },
          ]);
        } catch (err: any) {
          // Already linked or error
        }
      }
    }
  }

  console.log('Finished linking all product variants to inventory items and stock location!');
}
