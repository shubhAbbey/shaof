import { MedusaContainer } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';

export default async function seedInventory({ container }: { container: MedusaContainer }) {
  console.log('=== SEEDING INVENTORY LEVELS FOR STOCK LOCATION ===');
  try {
    const stockLocationModule = container.resolve(Modules.STOCK_LOCATION);
    const inventoryModule = container.resolve(Modules.INVENTORY);

    const [stockLocations] = await stockLocationModule.listAndCountStockLocations({});
    const stockLocation = stockLocations[0];
    console.log('Stock Location:', stockLocation.name, stockLocation.id);

    const [inventoryItems, count] = await inventoryModule.listAndCountInventoryItems({});
    console.log('Total inventory items found:', count);

    const existingLevels = await inventoryModule.listInventoryLevels({ location_id: stockLocation.id });
    console.log('Existing inventory levels for this location:', existingLevels.length);

    const existingItemIds = new Set(existingLevels.map((l: any) => l.inventory_item_id));
    const toCreate = inventoryItems
      .filter((item: any) => !existingItemIds.has(item.id))
      .map((item: any) => ({
        inventory_item_id: item.id,
        location_id: stockLocation.id,
        stocked_quantity: 100,
      }));

    if (toCreate.length > 0) {
      console.log(`Creating ${toCreate.length} inventory levels...`);
      const created = await inventoryModule.createInventoryLevels(toCreate);
      console.log('Successfully created inventory levels:', created.length);
    } else {
      console.log('All inventory items already have inventory levels.');
    }

    console.log('=== INVENTORY SEEDING FINISHED ===');
  } catch (err: any) {
    console.error('Error seeding inventory levels:', err);
  }
}
