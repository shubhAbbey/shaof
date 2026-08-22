import { MedusaContainer } from '@medusajs/framework/types';
import { Modules, ProductStatus } from '@medusajs/framework/utils';
import { createProductsWorkflow } from '@medusajs/medusa/core-flows';

export default async function seedCatalog({ container }: { container: MedusaContainer }) {
  console.log('Seeding Medusa v2 Catalog with rich multi-filter fashion products...');
  
  const productModule = container.resolve(Modules.PRODUCT);
  const salesChannelModule = container.resolve(Modules.SALES_CHANNEL);
  
  const [salesChannels] = await salesChannelModule.listAndCountSalesChannels();
  const defaultSalesChannel = salesChannels[0];
  if (!defaultSalesChannel) {
    console.error('No sales channel found!');
    return;
  }

  // 1. Categories
  const existingCategories = await productModule.listProductCategories();
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
  }

  // 2. Collections
  const existingCollections = await productModule.listProductCollections();
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
  }

  // Map category/collection handles to IDs
  const catMap = new Map(categories.map((c: any) => [c.handle, c.id]));
  const colMap = new Map(collections.map((c: any) => [c.handle, c.id]));

  // 3. Products
  const [existingProductsList] = await productModule.listAndCountProducts();
  const existingHandles = new Set(existingProductsList.map((p: any) => p.handle));

  const allProductsCatalog = [
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
          prices: [{ amount: 2199, currency_code: 'inr' }],
        },
        {
          title: 'Emerald Green / Free Size',
          sku: 'BAN-GRN-FS',
          options: { Color: 'Emerald Green', Size: 'Free Size' },
          prices: [{ amount: 2199, currency_code: 'inr' }],
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
    {
      title: 'Kanjivaram Woven Zari Pure Silk Saree',
      handle: 'kanjivaram-woven-zari-silk-saree',
      subtitle: 'Heirloom bridal Kanjivaram silk saree with contrast temple border',
      description: 'Handcrafted by master weavers with heavy pure gold zari pallu and rich silk luster.',
      thumbnail: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
      collection_id: colMap.get('festive-glam') || colMap.get('festive-edit'),
      category_ids: [catMap.get('women'), catMap.get('women-sarees')].filter(Boolean) as string[],
      sales_channels: [{ id: defaultSalesChannel.id }],
      status: ProductStatus.PUBLISHED,
      options: [
        { title: 'Color', values: ['Crimson Red', 'Peacock Blue'] },
        { title: 'Size', values: ['Free Size'] },
      ],
      variants: [
        {
          title: 'Crimson Red / Free Size',
          sku: 'KANJI-RED-FS',
          options: { Color: 'Crimson Red', Size: 'Free Size' },
          prices: [{ amount: 4299, currency_code: 'inr' }],
        },
        {
          title: 'Peacock Blue / Free Size',
          sku: 'KANJI-BLU-FS',
          options: { Color: 'Peacock Blue', Size: 'Free Size' },
          prices: [{ amount: 4299, currency_code: 'inr' }],
        },
      ],
      metadata: {
        brand: 'Virasat Heritage',
        original_price: 6499,
        is_hot: true,
      },
    },
    {
      title: 'Pure Cotton Chikankari Straight Kurta',
      handle: 'cotton-chikankari-straight-kurta',
      subtitle: 'Authentic Lucknowi hand-embroidered shadow work kurta',
      description: 'Featherlight summer kurta embellished with traditional floral chikankari embroidery on pure mulmul.',
      thumbnail: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80',
      collection_id: colMap.get('summer-meadow') || colMap.get('sale-ethnic'),
      category_ids: [catMap.get('women'), catMap.get('women-kurta-sets')].filter(Boolean) as string[],
      sales_channels: [{ id: defaultSalesChannel.id }],
      status: ProductStatus.PUBLISHED,
      options: [
        { title: 'Color', values: ['Pastel Pink', 'Ivory'] },
        { title: 'Size', values: ['S', 'M', 'L', 'XL'] },
      ],
      variants: [
        {
          title: 'Pastel Pink / M',
          sku: 'CHIKAN-PNK-M',
          options: { Color: 'Pastel Pink', Size: 'M' },
          prices: [{ amount: 1299, currency_code: 'inr' }],
        },
        {
          title: 'Pastel Pink / L',
          sku: 'CHIKAN-PNK-L',
          options: { Color: 'Pastel Pink', Size: 'L' },
          prices: [{ amount: 1299, currency_code: 'inr' }],
        },
        {
          title: 'Ivory / M',
          sku: 'CHIKAN-IVR-M',
          options: { Color: 'Ivory', Size: 'M' },
          prices: [{ amount: 1299, currency_code: 'inr' }],
        },
      ],
      metadata: {
        brand: 'Gulmohar Jaipur',
        original_price: 1999,
        is_new: true,
      },
    },
    {
      title: 'Classic Oxford Cotton Mandarin Shirt',
      handle: 'classic-oxford-cotton-mandarin-shirt',
      subtitle: 'Smart casual mandarin collar shirt in breathable poplin',
      description: 'Modern structured cotton shirt with curved hem, roll-up sleeve tabs, and tonal buttons.',
      thumbnail: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
      collection_id: colMap.get('capsule'),
      category_ids: [catMap.get('men'), catMap.get('men-casual-shirts')].filter(Boolean) as string[],
      sales_channels: [{ id: defaultSalesChannel.id }],
      status: ProductStatus.PUBLISHED,
      options: [
        { title: 'Color', values: ['Navy Blue', 'Sky Blue'] },
        { title: 'Size', values: ['M', 'L', 'XL'] },
      ],
      variants: [
        {
          title: 'Navy Blue / M',
          sku: 'OXFORD-NVY-M',
          options: { Color: 'Navy Blue', Size: 'M' },
          prices: [{ amount: 1199, currency_code: 'inr' }],
        },
        {
          title: 'Sky Blue / L',
          sku: 'OXFORD-SKY-L',
          options: { Color: 'Sky Blue', Size: 'L' },
          prices: [{ amount: 1199, currency_code: 'inr' }],
        },
      ],
      metadata: {
        brand: 'Loom & Thread',
        original_price: 1699,
      },
    },
    {
      title: 'Pleated Georgette Evening Maxi Gown',
      handle: 'pleated-georgette-evening-gown',
      subtitle: 'Flowing micro-pleated cocktail gown with metallic belt',
      description: 'Sophisticated floor-length evening dress with halter neckline and fluid cascading pleats.',
      thumbnail: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
      collection_id: colMap.get('summer-meadow'),
      category_ids: [catMap.get('women'), catMap.get('women-dresses')].filter(Boolean) as string[],
      sales_channels: [{ id: defaultSalesChannel.id }],
      status: ProductStatus.PUBLISHED,
      options: [
        { title: 'Color', values: ['Midnight Black', 'Wine Red'] },
        { title: 'Size', values: ['S', 'M', 'L'] },
      ],
      variants: [
        {
          title: 'Midnight Black / S',
          sku: 'GOWN-BLK-S',
          options: { Color: 'Midnight Black', Size: 'S' },
          prices: [{ amount: 2799, currency_code: 'inr' }],
        },
        {
          title: 'Wine Red / M',
          sku: 'GOWN-RED-M',
          options: { Color: 'Wine Red', Size: 'M' },
          prices: [{ amount: 2799, currency_code: 'inr' }],
        },
      ],
      metadata: {
        brand: 'Urban Drape',
        original_price: 4199,
        is_hot: true,
      },
    },
    {
      title: 'Embroidered Organza Party Saree',
      handle: 'embroidered-organza-party-saree',
      subtitle: 'Sheer pastel organza saree with scalloped resham borders',
      description: 'Delicate lightweight organza saree woven with dainty floral vines and shimmering sequin highlights.',
      thumbnail: 'https://images.unsplash.com/photo-1610030469668-9359f4258416?auto=format&fit=crop&w=800&q=80',
      collection_id: colMap.get('festive-glam'),
      category_ids: [catMap.get('women'), catMap.get('women-sarees')].filter(Boolean) as string[],
      sales_channels: [{ id: defaultSalesChannel.id }],
      status: ProductStatus.PUBLISHED,
      options: [
        { title: 'Color', values: ['Lavender', 'Mint Green'] },
        { title: 'Size', values: ['Free Size'] },
      ],
      variants: [
        {
          title: 'Lavender / Free Size',
          sku: 'ORG-LAV-FS',
          options: { Color: 'Lavender', Size: 'Free Size' },
          prices: [{ amount: 2899, currency_code: 'inr' }],
        },
        {
          title: 'Mint Green / Free Size',
          sku: 'ORG-MNT-FS',
          options: { Color: 'Mint Green', Size: 'Free Size' },
          prices: [{ amount: 2899, currency_code: 'inr' }],
        },
      ],
      metadata: {
        brand: 'Virasat Heritage',
        original_price: 4499,
        is_new: true,
      },
    },
    {
      title: 'Printed Rayon Flared A-Line Kurti',
      handle: 'printed-rayon-flared-kurti',
      subtitle: 'Daily wear soft rayon kurti with wooden button accents',
      description: 'Ultra-comfortable daily wear flared kurti featuring vibrant botanical block prints.',
      thumbnail: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
      collection_id: colMap.get('sale-ethnic'),
      category_ids: [catMap.get('women'), catMap.get('women-kurta-sets')].filter(Boolean) as string[],
      sales_channels: [{ id: defaultSalesChannel.id }],
      status: ProductStatus.PUBLISHED,
      options: [
        { title: 'Color', values: ['Mustard Yellow', 'Teal'] },
        { title: 'Size', values: ['XS', 'S', 'M', 'L', 'XL'] },
      ],
      variants: [
        {
          title: 'Mustard Yellow / M',
          sku: 'RAYON-MST-M',
          options: { Color: 'Mustard Yellow', Size: 'M' },
          prices: [{ amount: 899, currency_code: 'inr' }],
        },
        {
          title: 'Teal / L',
          sku: 'RAYON-TEL-L',
          options: { Color: 'Teal', Size: 'L' },
          prices: [{ amount: 899, currency_code: 'inr' }],
        },
      ],
      metadata: {
        brand: 'Gulmohar Jaipur',
        original_price: 1499,
      },
    },
    {
      title: 'Striped Breathable Linen Short Kurta',
      handle: 'striped-breathable-linen-short-kurta',
      subtitle: 'Contemporary fusion short kurta for men in yarn-dyed linen',
      description: 'Pairs effortlessly with jeans or chinos for a relaxed modern Indian aesthetic.',
      thumbnail: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
      collection_id: colMap.get('capsule'),
      category_ids: [catMap.get('men'), catMap.get('men-casual-shirts')].filter(Boolean) as string[],
      sales_channels: [{ id: defaultSalesChannel.id }],
      status: ProductStatus.PUBLISHED,
      options: [
        { title: 'Color', values: ['Natural Beige', 'Indigo'] },
        { title: 'Size', values: ['M', 'L', 'XL'] },
      ],
      variants: [
        {
          title: 'Natural Beige / M',
          sku: 'LIN-KRT-BEI-M',
          options: { Color: 'Natural Beige', Size: 'M' },
          prices: [{ amount: 1499, currency_code: 'inr' }],
        },
        {
          title: 'Indigo / L',
          sku: 'LIN-KRT-IND-L',
          options: { Color: 'Indigo', Size: 'L' },
          prices: [{ amount: 1499, currency_code: 'inr' }],
        },
      ],
      metadata: {
        brand: 'Loom & Thread',
        original_price: 2199,
        is_new: true,
      },
    },
    {
      title: 'Curve Plus A-Line Embroidered Kurti',
      handle: 'curve-plus-a-line-embroidered-kurti',
      subtitle: 'Specially patterned relaxed fit kurti with mirror embroidery',
      description: 'Tailored for inclusive sizing with forgiving side slits, 3/4 sleeves, and premium rayon fabric.',
      thumbnail: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80',
      collection_id: colMap.get('curve-curated') || colMap.get('sale-ethnic'),
      category_ids: [catMap.get('curve-plus'), catMap.get('women-kurta-sets')].filter(Boolean) as string[],
      sales_channels: [{ id: defaultSalesChannel.id }],
      status: ProductStatus.PUBLISHED,
      options: [
        { title: 'Color', values: ['Royal Blue', 'Rust Orange'] },
        { title: 'Size', values: ['1X', '2X', '3X'] },
      ],
      variants: [
        {
          title: 'Royal Blue / 1X',
          sku: 'PLUS-KUR-BLU-1X',
          options: { Color: 'Royal Blue', Size: '1X' },
          prices: [{ amount: 1599, currency_code: 'inr' }],
        },
        {
          title: 'Rust Orange / 2X',
          sku: 'PLUS-KUR-RST-2X',
          options: { Color: 'Rust Orange', Size: '2X' },
          prices: [{ amount: 1599, currency_code: 'inr' }],
        },
      ],
      metadata: {
        brand: 'Urban Drape',
        original_price: 2499,
        is_hot: true,
      },
    },
    {
      title: 'Ajrakh Handblock Modal Silk Saree',
      handle: 'ajrakh-handblock-modal-silk-saree',
      subtitle: 'Natural indigo and madder red geometric block print saree',
      description: 'Lustrous modal silk saree printed using traditional 16-stage Kachchh Ajrakh mud-resist technique.',
      thumbnail: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      collection_id: colMap.get('capsule') || colMap.get('festive-edit'),
      category_ids: [catMap.get('women'), catMap.get('women-sarees')].filter(Boolean) as string[],
      sales_channels: [{ id: defaultSalesChannel.id }],
      status: ProductStatus.PUBLISHED,
      options: [
        { title: 'Color', values: ['Maroon Red', 'Indigo Blue'] },
        { title: 'Size', values: ['Free Size'] },
      ],
      variants: [
        {
          title: 'Maroon Red / Free Size',
          sku: 'AJR-MAR-FS',
          options: { Color: 'Maroon Red', Size: 'Free Size' },
          prices: [{ amount: 3199, currency_code: 'inr' }],
        },
      ],
      metadata: {
        brand: 'Kora Weaves',
        original_price: 4999,
      },
    },
    {
      title: 'Relaxed Camp Collar Summer Shirt',
      handle: 'relaxed-camp-collar-summer-shirt',
      subtitle: 'Cuban collar tropical print shirt in airy viscose rayon',
      description: 'Easy-breezy weekend shirt designed for tropical getaways with relaxed boxy silhouette.',
      thumbnail: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
      collection_id: colMap.get('summer-meadow'),
      category_ids: [catMap.get('men'), catMap.get('men-casual-shirts')].filter(Boolean) as string[],
      sales_channels: [{ id: defaultSalesChannel.id }],
      status: ProductStatus.PUBLISHED,
      options: [
        { title: 'Color', values: ['Olive Green', 'Off White'] },
        { title: 'Size', values: ['S', 'M', 'L', 'XL'] },
      ],
      variants: [
        {
          title: 'Olive Green / M',
          sku: 'CAMP-OLV-M',
          options: { Color: 'Olive Green', Size: 'M' },
          prices: [{ amount: 999, currency_code: 'inr' }],
        },
        {
          title: 'Off White / L',
          sku: 'CAMP-WHT-L',
          options: { Color: 'Off White', Size: 'L' },
          prices: [{ amount: 999, currency_code: 'inr' }],
        },
      ],
      metadata: {
        brand: 'Loom & Thread',
        original_price: 1599,
        is_new: true,
      },
    },
  ];

  const missingProducts = allProductsCatalog.filter((p) => !existingHandles.has(p.handle));
  console.log(`Found ${missingProducts.length} new products to seed...`);

  if (missingProducts.length > 0) {
    const { result: createdProducts } = await createProductsWorkflow(container).run({
      input: {
        products: missingProducts,
      },
    });
    console.log(`Successfully created ${createdProducts.length} additional products!`);
  }

  const [allProds, total] = await productModule.listAndCountProducts();
  console.log(`Total active products in Medusa catalog: ${total}`);
  console.log('Catalog seeding complete.');
}
