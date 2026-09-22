import { MedusaContainer } from '@medusajs/framework/types';
import { Modules, ProductStatus, ContainerRegistrationKeys } from '@medusajs/framework/utils';
import {
  createProductsWorkflow,
  createStockLocationsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  createInventoryItemsWorkflow,
  createInventoryLevelsWorkflow,
} from '@medusajs/medusa/core-flows';

/**
 * Seed 1 comprehensive test product priced at ₹1 with multiple colors & sizes,
 * ensuring complete inventory items, stock levels (500 units), sales channel links,
 * and remote variant-inventory links for end-to-end checkout & payment verification.
 */
export default async function seedTestProduct({ container }: { container: MedusaContainer }) {
  console.log('=== SEEDING ₹1 TEST PRODUCT WITH MULTIPLE COLOR & SIZE VARIANTS ===');

  const productModule = container.resolve(Modules.PRODUCT);
  const salesChannelModule = container.resolve(Modules.SALES_CHANNEL);
  const stockLocationModule = container.resolve(Modules.STOCK_LOCATION);
  const inventoryModule = container.resolve(Modules.INVENTORY);
  const remoteLink = container.resolve(ContainerRegistrationKeys.LINK) || container.resolve('remoteLink');

  // --------------------------------------------------------------------------
  // 1. Resolve or Create Default Stock Location
  // --------------------------------------------------------------------------
  const [stockLocations] = await stockLocationModule.listAndCountStockLocations({});
  let defaultLocation = stockLocations[0];

  if (!defaultLocation) {
    console.log('No stock location found. Creating Delhi Central Warehouse...');
    const { result } = await createStockLocationsWorkflow(container).run({
      input: {
        locations: [
          {
            name: 'Delhi Central Warehouse',
            address: {
              address_1: 'Connaught Place',
              city: 'New Delhi',
              province: 'Delhi',
              postal_code: '110001',
              country_code: 'in',
            },
          },
        ],
      },
    });
    defaultLocation = result[0];
  }
  console.log(`Using Stock Location: ${defaultLocation.name} (${defaultLocation.id})`);

  // --------------------------------------------------------------------------
  // 2. Resolve Default Sales Channel & Ensure Link to Stock Location
  // --------------------------------------------------------------------------
  const [salesChannels] = await salesChannelModule.listAndCountSalesChannels();
  const defaultSalesChannel = salesChannels[0];
  if (!defaultSalesChannel) {
    throw new Error('No default sales channel found in Medusa!');
  }
  console.log(`Using Sales Channel: ${defaultSalesChannel.name} (${defaultSalesChannel.id})`);

  try {
    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: {
        id: defaultLocation.id,
        add: [defaultSalesChannel.id],
      },
    });
    console.log('Successfully linked Sales Channel to Stock Location via workflow.');
  } catch (err: any) {
    console.log('Sales channel workflow note:', err.message || 'Already linked');
  }

  try {
    await remoteLink.create([
      {
        [Modules.SALES_CHANNEL]: { sales_channel_id: defaultSalesChannel.id },
        [Modules.STOCK_LOCATION]: { stock_location_id: defaultLocation.id },
      },
    ]);
  } catch (err: any) {
    // Already linked
  }

  // --------------------------------------------------------------------------
  // 3. Resolve Category & Collection (Optional Context)
  // --------------------------------------------------------------------------
  const existingCategories = await productModule.listProductCategories();
  const existingCollections = await productModule.listProductCollections();

  const categoryIds: string[] = [];
  const menCategory = existingCategories.find(
    (c: any) => c.handle === 'men' || c.handle === 'men-casual-shirts'
  );
  if (menCategory) {
    categoryIds.push(menCategory.id);
  } else if (existingCategories.length > 0) {
    categoryIds.push(existingCategories[0].id);
  }

  const collectionId = existingCollections.length > 0 ? existingCollections[0].id : undefined;

  // --------------------------------------------------------------------------
  // 4. Product Definition (₹1 with 3 Colors x 3 Sizes = 9 Variants)
  // --------------------------------------------------------------------------
  const productHandle = 'classic-crewneck-cotton-tee-test';
  const colors = ['Jet Black', 'Pure White', 'Navy Blue'];
  const sizes = ['S', 'M', 'L'];

  // Color code abbreviations for SKU
  const colorSkuMap: Record<string, string> = {
    'Jet Black': 'BLK',
    'Pure White': 'WHT',
    'Navy Blue': 'NVY',
  };

  const variantsData = colors.flatMap((color) =>
    sizes.map((size) => ({
      title: `${color} / ${size}`,
      sku: `TEST-TEE-${colorSkuMap[color]}-${size}`,
      options: { Color: color, Size: size },
      prices: [{ amount: 1, currency_code: 'inr' }],
    }))
  );

  const productPayload = {
    title: 'Classic Crewneck Cotton Tee (₹1 Test)',
    handle: productHandle,
    subtitle: '100% Combed Cotton Everyday T-Shirt - ₹1 Live Testing Product',
    description:
      'Premium breathable organic combed cotton t-shirt designed for testing. Features cutaway seams, ribbed crew collar, and multiple color & size variants. Priced at exactly ₹1 for complete cart, shipping, and payment gateway verification.',
    thumbnail: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80' },
      { url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80' },
      { url: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=800&q=80' },
    ],
    collection_id: collectionId,
    category_ids: categoryIds.filter(Boolean),
    sales_channels: [{ id: defaultSalesChannel.id }],
    status: ProductStatus.PUBLISHED,
    options: [
      { title: 'Color', values: colors },
      { title: 'Size', values: sizes },
    ],
    variants: variantsData,
    metadata: {
      brand: 'Ateevra Basics',
      original_price: 499,
      is_new: true,
      is_testing: true,
    },
  };

  // --------------------------------------------------------------------------
  // 5. Create or Retrieve Product
  // --------------------------------------------------------------------------
  const [existingProducts] = await productModule.listAndCountProducts(
    { handle: productHandle },
    { relations: ['variants'] }
  );

  let product: any;
  if (existingProducts.length === 0) {
    console.log(`Creating product "${productPayload.title}" with 9 variants...`);
    const { result: createdProducts } = await createProductsWorkflow(container).run({
      input: {
        products: [productPayload],
      },
    });
    product = createdProducts[0];
    console.log(`Created product: ${product.title} (${product.id})`);
  } else {
    product = existingProducts[0];
    console.log(`Found existing product: ${product.title} (${product.id})`);
  }

  // --------------------------------------------------------------------------
  // 6. Ensure Inventory Items, Stock Levels & Remote Links for ALL Variants
  // --------------------------------------------------------------------------
  const [freshProducts] = await productModule.listAndCountProducts(
    { id: product.id },
    { relations: ['variants'] }
  );
  const variants = freshProducts[0]?.variants || [];
  console.log(`Ensuring inventory and links for ${variants.length} variants...`);

  for (const variant of variants) {
    const sku = variant.sku || `TEST-TEE-${variant.id}`;
    console.log(`\n-> Variant: ${variant.title} (SKU: ${sku}, ID: ${variant.id})`);

    // A. Find or create Inventory Item
    let [existingItems] = await inventoryModule.listAndCountInventoryItems({ sku });
    let item = existingItems[0];

    if (!item) {
      console.log(`   Creating inventory item for SKU: ${sku}...`);
      const { result } = await createInventoryItemsWorkflow(container).run({
        input: {
          items: [
            {
              sku,
              title: variant.title,
              location_levels: [
                {
                  location_id: defaultLocation.id,
                  stocked_quantity: 500,
                },
              ],
            },
          ],
        },
      });
      item = result[0];
      console.log(`   Created inventory item: ${item.id} with 500 units in stock.`);
    } else {
      console.log(`   Found existing inventory item: ${item.id}`);
      // Ensure Inventory Level at defaultLocation
      const [levels] = await inventoryModule.listAndCountInventoryLevels({
        inventory_item_id: item.id,
        location_id: defaultLocation.id,
      });

      if (levels.length === 0) {
        console.log(`   Creating inventory level for location ${defaultLocation.id}...`);
        await createInventoryLevelsWorkflow(container).run({
          input: {
            inventory_levels: [
              {
                inventory_item_id: item.id,
                location_id: defaultLocation.id,
                stocked_quantity: 500,
              },
            ],
          },
        });
        console.log(`   Created level with 500 units.`);
      } else if (levels[0].stocked_quantity < 10) {
        console.log(`   Updating stock level to 500 units...`);
        await inventoryModule.updateInventoryLevels([
          {
            inventory_item_id: item.id,
            location_id: defaultLocation.id,
            stocked_quantity: 500,
          },
        ]);
      } else {
        console.log(`   Existing stock level is healthy: ${levels[0].stocked_quantity} units.`);
      }
    }

    // B. Ensure Remote Link (Product Variant -> Inventory Item)
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
        console.log(`   [LINKED] Variant ${variant.id} <--> Inventory Item ${item.id}`);
      } catch (linkErr: any) {
        console.log(`   [LINK NOTE] Variant ${variant.id}: ${linkErr.message || 'Already linked'}`);
      }
    }
  }

  console.log('\n=== ₹1 TEST PRODUCT SEEDING COMPLETED SUCCESSFULLY ===');
  console.log(`Handle: ${productHandle}`);
  console.log(`PDP URL: /product/${productHandle}`);
  console.log(`Variants Count: ${variants.length}`);
  console.log(`Price: ₹1 for all variants`);
  console.log(`Stock: 500 units per variant at ${defaultLocation.name}`);
}
