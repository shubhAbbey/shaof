import { MedusaContainer } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';
import { createInventoryLevelsWorkflow } from '@medusajs/medusa/core-flows';

export default async function linkInventoryLevels({ container }: { container: MedusaContainer }) {
  console.log('Checking Inventory Items and Stock Locations...');
  const inventoryModule = container.resolve(Modules.INVENTORY);
  const stockLocationModule = container.resolve(Modules.STOCK_LOCATION);

  const [locations] = await stockLocationModule.listAndCountStockLocations({});
  const defaultLocation = locations[0];
  if (!defaultLocation) {
    console.error('No stock location found!');
    return;
  }
  console.log('Using Stock Location:', defaultLocation.id, defaultLocation.name);

  const [inventoryItems, count] = await inventoryModule.listAndCountInventoryItems({});
  console.log(`Found ${count} inventory items`);

  for (const item of inventoryItems) {
    const [levels] = await inventoryModule.listAndCountInventoryLevels({
      inventory_item_id: item.id,
      location_id: defaultLocation.id,
    });

    if (levels.length === 0) {
      console.log(`Creating inventory level for item ${item.id} with quantity 100...`);
      await createInventoryLevelsWorkflow(container).run({
        input: {
          inventory_levels: [
            {
              inventory_item_id: item.id,
              location_id: defaultLocation.id,
              stocked_quantity: 100,
            },
          ],
        },
      });
    }
  }

  console.log('Finished updating inventory levels for all items!');
}
