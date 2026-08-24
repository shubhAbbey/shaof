import { MedusaContainer } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';
import { linkSalesChannelsToStockLocationWorkflow } from '@medusajs/medusa/core-flows';

export default async function linkStockLocation({ container }: { container: MedusaContainer }) {
  console.log('Linking Sales Channels to Stock Location via official Medusa workflow...');
  const stockLocationModule = container.resolve(Modules.STOCK_LOCATION);
  const salesChannelModule = container.resolve(Modules.SALES_CHANNEL);

  const [salesChannels] = await salesChannelModule.listAndCountSalesChannels();
  const defaultSalesChannel = salesChannels[0];
  console.log('Sales Channel:', defaultSalesChannel?.id, defaultSalesChannel?.name);

  const [stockLocations] = await stockLocationModule.listAndCountStockLocations({});
  const defaultLocation = stockLocations[0];
  console.log('Stock Location:', defaultLocation?.id, defaultLocation?.name);

  if (defaultSalesChannel && defaultLocation) {
    console.log(`Running linkSalesChannelsToStockLocationWorkflow for location ${defaultLocation.id} with sales channel ${defaultSalesChannel.id}...`);
    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: {
        id: defaultLocation.id,
        add: [defaultSalesChannel.id],
      },
    });
    console.log('Successfully linked Sales Channel to Stock Location via workflow!');
  }
}
