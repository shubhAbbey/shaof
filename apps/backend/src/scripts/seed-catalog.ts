import { MedusaContainer } from '@medusajs/framework/types';
import { Modules, ProductStatus } from '@medusajs/framework/utils';
import { createProductsWorkflow } from '@medusajs/medusa/core-flows';

export default async function seedCatalog({ container }: { container: MedusaContainer }) {
  console.log('Seeding Medusa v2 Catalog...');
  
  const productModule = container.resolve(Modules.PRODUCT);
  const salesChannelModule = container.resolve(Modules.SALES_CHANNEL);
  
  const [salesChannels] = await salesChannelModule.listAndCountSalesChannels();
  console.log('Found sales channels:', salesChannels.map((s: any) => ({ id: s.id, name: s.name })));
  
  const defaultSalesChannel = salesChannels[0];
  if (!defaultSalesChannel) {
    console.error('No sales channel found!');
    return;
  }

  // 1. Categories
  const existingCategories = await productModule.listProductCategories();
  console.log('Existing categories:', existingCategories.length);
  
  let categories = existingCategories;
  if (existingCategories.length === 0) {
    categories = await productModule.createProductCategories([
      { name: 'Women', handle: 'women', is_active: true },
      { name: 'Men', handle: 'men', is_active: true },
      { name: 'Curve + Plus', handle: 'curve-plus', is_active: true },
      { name: 'Kids', handle: 'kids', is_active: true },
      { name: 'Home & Living', handle: 'home-living', is_active: true },
      { name: 'Beauty', handle: 'beauty', is_active: true },
      { name: 'Sarees & Blouses', handle: 'women-sarees', is_active: true },
      { name: 'Kurta & Kurti Sets', handle: 'women-kurta-sets', is_active: true },
      { name: 'Dresses & Jumpsuits', handle: 'women-dresses', is_active: true },
      { name: 'Casual Shirts', handle: 'men-casual-shirts', is_active: true },
    ]);
    console.log('Created categories:', categories.length);
  }

  // 2. Collections
  const existingCollections = await productModule.listProductCollections();
  console.log('Existing collections:', existingCollections.length);
  
  let collections = existingCollections;
  if (existingCollections.length === 0) {
    collections = await productModule.createProductCollections([
      { title: 'Summer Meadow Collection', handle: 'summer-meadow' },
      { title: 'Festive Glam Edit', handle: 'festive-glam' },
      { title: 'Curated Festive Edit', handle: 'festive-edit' },
      { title: 'The Linen & Silk Capsule', handle: 'capsule' },
      { title: 'Top Steals in Ethnic Wear', handle: 'sale-ethnic' },
      { title: 'All Body Confident Fits', handle: 'curve-curated' },
    ]);
    console.log('Created collections:', collections.length);
  }

  // Map category/collection handles to IDs
  const catMap = new Map(categories.map((c: any) => [c.handle, c.id]));
  const colMap = new Map(collections.map((c: any) => [c.handle, c.id]));

  // 3. Products with INR pricing and variant options
  const [existingProducts, prodCount] = await productModule.listAndCountProducts();
  console.log('Existing products:', prodCount);

  if (prodCount === 0) {
    const productsToCreate = [
      {
        title: 'Zari Border Banarasi Art Silk Saree',
        handle: 'banarasi-art-silk-saree',
        subtitle: 'Authentic Banarasi weave with rich gold zari floral pallu',
        description: 'Exquisite banarasi art silk saree designed with traditional motifs, gold zari work, and comes with an unstitched blouse piece.',
        thumbnail: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        collection_id: colMap.get('festive-glam') || colMap.get('festive-edit'),
        category_ids: [catMap.get('women'), catMap.get('women-sarees')].filter(Boolean) as string[],
        sales_channels: [{ id: defaultSalesChannel.id }],
        status: ProductStatus.PUBLISHED,
        options: [
          { title: 'Color', values: ['Royal Magenta', 'Emerald Green'] },
          { title: 'Size', values: ['Free Size'] },
        ],
        variants: [
          {
            title: 'Royal Magenta / Free Size',
            sku: 'BAN-MAG-FS',
            options: { Color: 'Royal Magenta', Size: 'Free Size' },
            prices: [
              { amount: 2199, currency_code: 'inr' },
            ],
          },
          {
            title: 'Emerald Green / Free Size',
            sku: 'BAN-GRN-FS',
            options: { Color: 'Emerald Green', Size: 'Free Size' },
            prices: [
              { amount: 2199, currency_code: 'inr' },
            ],
          },
        ],
        metadata: {
          brand: 'Virasat Heritage',
          original_price: 3499,
          is_hot: true,
        },
      },
      {
        title: 'Flared Handblock Cotton Kurti with Palazzo',
        handle: 'flared-handblock-cotton-kurti-palazzo',
        subtitle: 'Pure cambric cotton 2-piece ethnic set with gota patti detailing',
        description: 'Breathable, lightweight 100% cotton flared kurti paired with matching palazzo pants featuring intricate Rajasthani handblock prints.',
        thumbnail: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
        collection_id: colMap.get('sale-ethnic') || colMap.get('summer-meadow'),
        category_ids: [catMap.get('women'), catMap.get('women-kurta-sets')].filter(Boolean) as string[],
        sales_channels: [{ id: defaultSalesChannel.id }],
        status: ProductStatus.PUBLISHED,
        options: [
          { title: 'Size', values: ['S', 'M', 'L', 'XL'] },
        ],
        variants: [
          {
            title: 'Size S',
            sku: 'KURTI-COT-S',
            options: { Size: 'S' },
            prices: [{ amount: 1699, currency_code: 'inr' }],
          },
          {
            title: 'Size M',
            sku: 'KURTI-COT-M',
            options: { Size: 'M' },
            prices: [{ amount: 1699, currency_code: 'inr' }],
          },
          {
            title: 'Size L',
            sku: 'KURTI-COT-L',
            options: { Size: 'L' },
            prices: [{ amount: 1699, currency_code: 'inr' }],
          },
        ],
        metadata: {
          brand: 'Gulmohar Jaipur',
          original_price: 2599,
          is_hot: true,
        },
      },
      {
        title: 'Slim Fit Pure Linen Casual Shirt',
        handle: 'slim-fit-pure-linen-casual-shirt',
        subtitle: '100% French flax linen shirt in pastel sage',
        description: 'Premium organic linen casual button-down shirt designed with cutaway collar and tailored modern slim fit.',
        thumbnail: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
        collection_id: colMap.get('capsule'),
        category_ids: [catMap.get('men'), catMap.get('men-casual-shirts')].filter(Boolean) as string[],
        sales_channels: [{ id: defaultSalesChannel.id }],
        status: ProductStatus.PUBLISHED,
        options: [
          { title: 'Size', values: ['M', 'L', 'XL'] },
          { title: 'Color', values: ['Sage Green', 'Pure White'] },
        ],
        variants: [
          {
            title: 'Sage Green / M',
            sku: 'SHIRT-LIN-SAGE-M',
            options: { Size: 'M', Color: 'Sage Green' },
            prices: [{ amount: 1399, currency_code: 'inr' }],
          },
          {
            title: 'Sage Green / L',
            sku: 'SHIRT-LIN-SAGE-L',
            options: { Size: 'L', Color: 'Sage Green' },
            prices: [{ amount: 1399, currency_code: 'inr' }],
          },
          {
            title: 'Pure White / M',
            sku: 'SHIRT-LIN-WHT-M',
            options: { Size: 'M', Color: 'Pure White' },
            prices: [{ amount: 1399, currency_code: 'inr' }],
          },
        ],
        metadata: {
          brand: 'Loom & Thread',
          original_price: 1999,
        },
      },
      {
        title: 'Tiered Mulmul Floral Summer Midi Dress',
        handle: 'tiered-mulmul-floral-summer-midi-dress',
        subtitle: 'Breezy multi-tiered silhouette with romantic puff sleeves',
        description: 'Effortless tiered midi dress crafted from ultra-soft fine mulmul featuring botanical block prints and adjustable waist tie.',
        thumbnail: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
        collection_id: colMap.get('summer-meadow'),
        category_ids: [catMap.get('women'), catMap.get('women-dresses')].filter(Boolean) as string[],
        sales_channels: [{ id: defaultSalesChannel.id }],
        status: ProductStatus.PUBLISHED,
        options: [
          { title: 'Size', values: ['XS', 'S', 'M', 'L'] },
        ],
        variants: [
          {
            title: 'XS',
            sku: 'DRESS-MUL-XS',
            options: { Size: 'XS' },
            prices: [{ amount: 1599, currency_code: 'inr' }],
          },
          {
            title: 'S',
            sku: 'DRESS-MUL-S',
            options: { Size: 'S' },
            prices: [{ amount: 1599, currency_code: 'inr' }],
          },
          {
            title: 'M',
            sku: 'DRESS-MUL-M',
            options: { Size: 'M' },
            prices: [{ amount: 1599, currency_code: 'inr' }],
          },
        ],
        metadata: {
          brand: 'Meadow Studio',
          original_price: 2399,
          is_new: true,
        },
      },
      {
        title: 'Handloom Chanderi Silk Anarkali Suit',
        handle: 'handloom-chanderi-silk-anarkali-suit',
        subtitle: 'Festive 3-piece suit with hand-embroidered organza dupatta',
        description: 'Regal Chanderi silk anarkali kurti with intricate threadwork and matching churidar pants.',
        thumbnail: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80',
        collection_id: colMap.get('festive-edit') || colMap.get('festive-glam'),
        category_ids: [catMap.get('women'), catMap.get('women-kurta-sets')].filter(Boolean) as string[],
        sales_channels: [{ id: defaultSalesChannel.id }],
        status: ProductStatus.PUBLISHED,
        options: [
          { title: 'Size', values: ['S', 'M', 'L', 'XL'] },
        ],
        variants: [
          {
            title: 'M',
            sku: 'ANARKALI-CHAN-M',
            options: { Size: 'M' },
            prices: [{ amount: 3499, currency_code: 'inr' }],
          },
          {
            title: 'L',
            sku: 'ANARKALI-CHAN-L',
            options: { Size: 'L' },
            prices: [{ amount: 3499, currency_code: 'inr' }],
          },
        ],
        metadata: {
          brand: 'Virasat Heritage',
          original_price: 5499,
          is_hot: true,
        },
      },
      {
        title: 'Curve Plus Wrap Style Maxi Dress',
        handle: 'curve-plus-wrap-style-maxi-dress',
        subtitle: 'Flattering stretch jersey wrap dress with belted waist',
        description: 'Designed specifically to accentuate curves with high-comfort breathable poly-elastane stretch blend.',
        thumbnail: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80',
        collection_id: colMap.get('curve-curated'),
        category_ids: [catMap.get('curve-plus'), catMap.get('women-dresses')].filter(Boolean) as string[],
        sales_channels: [{ id: defaultSalesChannel.id }],
        status: ProductStatus.PUBLISHED,
        options: [
          { title: 'Size', values: ['1X', '2X', '3X'] },
        ],
        variants: [
          {
            title: '1X',
            sku: 'PLUS-WRAP-1X',
            options: { Size: '1X' },
            prices: [{ amount: 1899, currency_code: 'inr' }],
          },
          {
            title: '2X',
            sku: 'PLUS-WRAP-2X',
            options: { Size: '2X' },
            prices: [{ amount: 1899, currency_code: 'inr' }],
          },
        ],
        metadata: {
          brand: 'Meadow Studio',
          original_price: 2799,
          is_new: true,
        },
      },
    ];

    const { result: createdProducts } = await createProductsWorkflow(container).run({
      input: {
        products: productsToCreate,
      },
    });

    console.log(`Successfully created ${createdProducts.length} products with variants and INR pricing!`);
  }

  const [allProds, total] = await productModule.listAndCountProducts();
  console.log(`Final product count in Medusa: ${total}`);
  console.log('Seeding completed successfully!');
}
