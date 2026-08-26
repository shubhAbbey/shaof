import { MedusaContainer } from '@medusajs/framework/types';
import { Modules, RuleOperator, ShippingOptionPriceType, ContainerRegistrationKeys } from '@medusajs/framework/utils';
import {
  createLocationFulfillmentSetWorkflow,
  createServiceZonesWorkflow,
  createShippingOptionsWorkflow,
  updateStockLocationsWorkflow,
  batchLinksWorkflow,
} from '@medusajs/medusa/core-flows';

export default async function seedShipping({ container }: { container: MedusaContainer }) {
  console.log('=== SEEDING MEDUSA V2 SHIPPING CONFIGURATION ===');

  const stockLocationModule = container.resolve(Modules.STOCK_LOCATION);
  const salesChannelModule = container.resolve(Modules.SALES_CHANNEL);
  const fulfillmentModule = container.resolve(Modules.FULFILLMENT);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  // 1. Stock Location (Ensure Delhi Stock Location)
  const [stockLocations] = await stockLocationModule.listAndCountStockLocations({});
  if (stockLocations.length === 0) {
    console.error('No stock location found! Cannot configure shipping.');
    return;
  }
  let stockLocation = stockLocations[0];

  // Update stock location to Delhi Central Warehouse if not already named so
  if (stockLocation.name !== 'Delhi Central Warehouse') {
    console.log(`Updating Stock Location ${stockLocation.id} to Delhi Central Warehouse...`);
    await updateStockLocationsWorkflow(container).run({
      input: {
        selector: {
          id: stockLocation.id,
        },
        update: {
          name: 'Delhi Central Warehouse',
          address: {
            address_1: 'Connaught Place',
            city: 'New Delhi',
            province: 'Delhi',
            postal_code: '110001',
            country_code: 'in',
          },
        },
      },
    });
    const [refreshedLocations] = await stockLocationModule.listAndCountStockLocations({});
    stockLocation = refreshedLocations[0];
  }
  console.log(`Using Stock Location: ${stockLocation.name} (${stockLocation.id})`);

  // 2. Sales Channel
  const [salesChannels] = await salesChannelModule.listAndCountSalesChannels({});
  const salesChannel = salesChannels[0];
  console.log(`Using Sales Channel: ${salesChannel.name} (${salesChannel.id})`);

  // Ensure Sales Channel is linked to Delhi Stock Location
  try {
    const link = container.resolve(ContainerRegistrationKeys.LINK);
    await link.create([
      {
        [Modules.SALES_CHANNEL]: { sales_channel_id: salesChannel.id },
        [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
      },
    ]);
  } catch (e: any) {
    console.log('Sales channel link note:', e.message || 'Already linked');
  }

  // 3. Ensure Fulfillment Provider is linked to Stock Location
  console.log('Linking fulfillment provider "manual_manual" to stock location...');
  try {
    await batchLinksWorkflow(container).run({
      input: {
        create: [
          {
            [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
            [Modules.FULFILLMENT]: { fulfillment_provider_id: 'manual_manual' },
          },
        ],
      },
    });
  } catch (linkErr: any) {
    console.log('Link note:', linkErr.message || 'Already linked or processed');
  }

  // 4. Fulfillment Set on Stock Location
  const existingFulfillmentSets = await fulfillmentModule.listFulfillmentSets();
  let fulfillmentSet = existingFulfillmentSets.find(
    (fs: any) => fs.type === 'shipping' || fs.name === 'Standard Shipping'
  );

  if (!fulfillmentSet) {
    console.log(`Creating shipping fulfillment set on location ${stockLocation.id}...`);
    await createLocationFulfillmentSetWorkflow(container).run({
      input: {
        location_id: stockLocation.id,
        fulfillment_set_data: {
          name: 'Standard Shipping',
          type: 'shipping',
        },
      },
    });

    const refreshedSets = await fulfillmentModule.listFulfillmentSets();
    fulfillmentSet = refreshedSets.find((fs: any) => fs.type === 'shipping' || fs.name === 'Standard Shipping');
  } else {
    console.log(`Found existing fulfillment set: ${fulfillmentSet.name} (${fulfillmentSet.id})`);
    // Ensure it is linked to stock location via remoteLink
    try {
      const link = container.resolve(ContainerRegistrationKeys.LINK);
      await link.create([
        {
          [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
          [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
        },
      ]);
    } catch (e: any) {
      console.log('Fulfillment set link note:', e.message || 'Already linked');
    }
  }

  if (!fulfillmentSet) {
    console.error('Failed to resolve fulfillment set for stock location!');
    return;
  }

  // 5. Service Zone (India) under Fulfillment Set
  const existingServiceZones = await fulfillmentModule.listServiceZones();
  let serviceZone = existingServiceZones.find(
    (sz: any) => sz.name === 'India' && sz.fulfillment_set_id === fulfillmentSet.id
  );

  if (!serviceZone) {
    console.log(`Creating India service zone for fulfillment set ${fulfillmentSet.id}...`);
    const { result } = await createServiceZonesWorkflow(container).run({
      input: {
        data: [
          {
            name: 'India',
            fulfillment_set_id: fulfillmentSet.id,
            geo_zones: [
              {
                type: 'country',
                country_code: 'in',
              },
            ],
          },
        ],
      },
    });
    serviceZone = result[0];
    console.log(`Created service zone: ${serviceZone.name} (${serviceZone.id})`);
  } else {
    console.log(`Found existing service zone: ${serviceZone.name} (${serviceZone.id})`);
  }

  // 6. Shipping Profile
  const shippingProfiles = await fulfillmentModule.listShippingProfiles({ type: 'default' });
  const defaultProfile = shippingProfiles[0];
  if (!defaultProfile) {
    console.error('No default shipping profile found!');
    return;
  }
  console.log(`Using Shipping Profile: ${defaultProfile.name} (${defaultProfile.id})`);

  // 7. Shipping Option (Standard Delivery - ₹0)
  const existingOptions = await fulfillmentModule.listShippingOptions();
  let shippingOption = existingOptions.find(
    (opt: any) => opt.name === 'Standard Delivery' && opt.service_zone_id === serviceZone.id
  );

  if (!shippingOption) {
    console.log(`Creating Standard Delivery shipping option under service zone ${serviceZone.id}...`);
    const { result } = await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: 'Standard Delivery',
          service_zone_id: serviceZone.id,
          shipping_profile_id: defaultProfile.id,
          provider_id: 'manual_manual',
          price_type: 'flat' as ShippingOptionPriceType,
          type: {
            label: 'Standard',
            description: 'Standard Delivery (3-5 business days)',
            code: 'standard',
          },
          prices: [
            {
              currency_code: 'inr',
              amount: 0,
            },
          ],
          rules: [
            {
              attribute: 'enabled_in_store',
              operator: RuleOperator.EQ,
              value: 'true',
            },
            {
              attribute: 'is_return',
              operator: RuleOperator.EQ,
              value: 'false',
            },
          ],
        },
      ],
    });
    shippingOption = result[0];
    console.log(`Successfully created shipping option: ${shippingOption.name} (${shippingOption.id})`);
  } else {
    console.log(`Found existing shipping option: ${shippingOption.name} (${shippingOption.id})`);
  }

  console.log('=== MEDUSA SHIPPING CONFIGURATION COMPLETE ===');
}
