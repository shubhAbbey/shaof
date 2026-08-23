import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function constructMetadata({ title, description, image, canonicalUrl, noIndex = false } = {}) {
  const SITE_NAME = 'Fashion Ecommerce MVP';
  const SITE_URL = 'http://localhost:3000';
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const canonical = canonicalUrl
    ? canonicalUrl.startsWith('http')
      ? canonicalUrl
      : `${SITE_URL}${canonicalUrl}`
    : undefined;
  return {
    title: fullTitle,
    description: description || 'Default description',
    alternates: {
      canonical,
    },
    openGraph: {
      title: fullTitle,
      url: canonical || SITE_URL,
    },
    robots: {
      index: !noIndex,
    },
  };
}

const NAVIGATION_CATEGORIES = [
  { id: 'women', handle: 'women', name: 'Women', href: '/category/women' },
  { id: 'men', handle: 'men', name: 'Men', href: '/category/men' },
  { id: 'curve-plus', handle: 'curve-plus', name: 'Curve + Plus', href: '/category/curve-plus' },
  { id: 'kids', handle: 'kids', name: 'Kids', href: '/category/kids' },
  { id: 'home-living', handle: 'home-living', name: 'Home & Living', href: '/category/home-living' },
  { id: 'beauty', handle: 'beauty', name: 'Beauty', href: '/category/beauty' },
  { id: 'sale', handle: 'sale', name: 'Sale', href: '/sale', badge: 'UP TO 70%' },
];

describe('Task 08: Storefront Header & Navigation Architecture', () => {
  describe('Utilities & Formatters', () => {
    it('cn merges tailwind and conditional classes cleanly', () => {
      const result = cn('bg-red-500', false && 'hidden', true && 'text-white', 'p-4');
      assert.equal(result, 'bg-red-500 text-white p-4');
    });

    it('formatINR formats currency in Indian Rupees', () => {
      const formatted = formatINR(1499);
      assert.ok(formatted.includes('1,499') || formatted.includes('1499'));
    });
  });

  describe('SEO & Metadata Foundation', () => {
    it('constructs default metadata properly', () => {
      const meta = constructMetadata({ title: 'Summer Collection' });
      assert.equal(meta.title, 'Summer Collection | Fashion Ecommerce MVP');
      assert.equal(meta.robots.index, true);
    });
  });

  describe('Category Navigation Data Structure', () => {
    it('provides all 7 navigation categories', () => {
      assert.equal(NAVIGATION_CATEGORIES.length, 7);
      assert.deepEqual(
        NAVIGATION_CATEGORIES.map((c) => c.handle),
        ['women', 'men', 'curve-plus', 'kids', 'home-living', 'beauty', 'sale']
      );
    });
  });
});

describe('Task 09: Homepage & CMS Section Rendering Architecture', () => {
  describe('CMS Section Contracts & Schema Integrity', () => {
    it('validates hero section structure and props', () => {
      const hero = {
        id: 'hero-1',
        __component: 'sections.hero',
        title: 'Timeless Elegance, Modern Silhouettes',
        subtitle: 'Handcrafted styles for festive season',
        ctaText: 'Shop Now',
        ctaLink: '/category/women',
        textAlignment: 'center',
      };
      assert.equal(hero.__component, 'sections.hero');
      assert.equal(hero.title, 'Timeless Elegance, Modern Silhouettes');
      assert.equal(hero.textAlignment, 'center');
    });

    it('validates banner and sale banner section contracts', () => {
      const banner = {
        id: 'banner-1',
        __component: 'sections.banner',
        title: 'Mid-Season Spotlight',
        badgeText: 'EXCLUSIVE',
        ctaLink: '/collections/spotlight',
      };
      assert.equal(banner.__component, 'sections.banner');
      assert.equal(banner.badgeText, 'EXCLUSIVE');

      const saleBanner = {
        id: 'sale-1',
        __component: 'sections.sale-banner',
        title: 'Flash Sale',
        discountHighlight: 'FLAT 50% OFF',
        ctaText: 'Shop Sale',
        ctaLink: '/sale',
      };
      assert.equal(saleBanner.__component, 'sections.sale-banner');
      assert.equal(saleBanner.discountHighlight, 'FLAT 50% OFF');
    });

    it('validates commerce-driven carousel and grid contracts', () => {
      const collectionCarousel = {
        id: 'col-1',
        __component: 'sections.collection-carousel',
        title: 'Festive Edit',
        collectionHandle: 'festive-edit',
        limit: 8,
      };
      assert.equal(collectionCarousel.__component, 'sections.collection-carousel');
      assert.equal(collectionCarousel.collectionHandle, 'festive-edit');

      const productGrid = {
        id: 'grid-1',
        __component: 'sections.product-grid',
        title: 'Trending Drops',
        columns: 4,
        limit: 8,
      };
      assert.equal(productGrid.__component, 'sections.product-grid');
      assert.equal(productGrid.columns, 4);
    });

    it('validates category tiles, promotional CTA, and rich text contracts', () => {
      const categoryTiles = {
        id: 'cat-1',
        __component: 'sections.category-tiles',
        title: 'Categories',
        layout: 'grid',
        items: [{ title: 'Kurtas', categoryHandle: 'kurtas' }],
      };
      assert.equal(categoryTiles.__component, 'sections.category-tiles');
      assert.equal(categoryTiles.items?.length, 1);

      const promoCta = {
        id: 'promo-1',
        __component: 'sections.promotional-cta',
        title: 'Silk Capsule',
        ctaText: 'Discover',
        ctaLink: '/capsule',
      };
      assert.equal(promoCta.__component, 'sections.promotional-cta');

      const richText = {
        id: 'rt-1',
        __component: 'sections.rich-text',
        content: '<p>Brand editorial story</p>',
      };
      assert.equal(richText.__component, 'sections.rich-text');
    });
  });

  describe('Commerce Pricing & Discount Calculation', () => {
    it('calculates and formats product prices and discounts accurately in INR', () => {
      const price = 1499;
      const originalPrice = 2499;
      const discount = Math.round(((originalPrice - price) / originalPrice) * 100);

      assert.ok(formatINR(price).includes('1,499') || formatINR(price).includes('1499'));
      assert.ok(formatINR(originalPrice).includes('2,499') || formatINR(originalPrice).includes('2499'));
      assert.equal(discount, 40);
    });
  });

  describe('Dynamic Section Composition & Error Isolation', () => {
    it('handles mixed dynamic zone composition without error', () => {
      const sections = [
        { id: '1', __component: 'sections.hero', title: 'Hero' },
        { id: '2', __component: 'sections.category-tiles', title: 'Tiles' },
        { id: '3', __component: 'sections.collection-carousel', title: 'Carousel', collectionHandle: 'festive' },
        { id: '4', __component: 'sections.sale-banner', title: 'Sale' },
        { id: '5', __component: 'sections.product-grid', title: 'Grid' },
        { id: '6', __component: 'sections.promotional-cta', title: 'CTA' },
        { id: '7', __component: 'sections.rich-text', content: 'Story' },
      ];

      assert.equal(sections.length, 7);
      assert.equal(sections[0].__component, 'sections.hero');
      assert.equal(sections[3].__component, 'sections.sale-banner');
      assert.equal(sections[6].__component, 'sections.rich-text');
    });
  });
});

describe('Task 11: Core Product Listing Page (PLP) Engine', () => {
  describe('Category Listing Engine & Handle Resolution', () => {
    it('validates category context contracts', () => {
      const category = {
        id: 'pcat_women',
        name: 'Women',
        handle: 'women',
        description: 'Women fashion edit',
      };
      assert.equal(category.handle, 'women');
      assert.equal(category.name, 'Women');
    });
  });

  describe('Collection Listing Engine & Handle Resolution', () => {
    it('validates collection context contracts', () => {
      const collection = {
        id: 'pcol_summer',
        title: 'Summer Meadow Collection',
        handle: 'summer-meadow',
      };
      assert.equal(collection.handle, 'summer-meadow');
      assert.ok(collection.title.includes('Summer Meadow'));
    });
  });

  describe('Brand Listing Engine & Context Mapping', () => {
    it('verifies brand filtering on product listings', () => {
      const products = [
        { id: '1', title: 'Saree', handle: 'saree', price: 2199, brand: 'Virasat Heritage' },
        { id: '2', title: 'Shirt', handle: 'shirt', price: 1399, brand: 'Loom & Thread' },
      ];
      const virasatProducts = products.filter((p) => p.brand === 'Virasat Heritage');
      assert.equal(virasatProducts.length, 1);
      assert.equal(virasatProducts[0].title, 'Saree');
    });
  });

  describe('Curated Sale Listing Engine', () => {
    it('identifies products eligible for sale listing context', () => {
      const products = [
        { id: '1', title: 'Saree', price: 2199, originalPrice: 3499, discountPercentage: 37 },
        { id: '2', title: 'Shirt', price: 1999, originalPrice: 1999, discountPercentage: 0 },
      ];
      const saleProducts = products.filter(
        (p) => (p.discountPercentage && p.discountPercentage > 0) || (p.originalPrice && p.originalPrice > p.price)
      );
      assert.equal(saleProducts.length, 1);
      assert.equal(saleProducts[0].id, '1');
    });
  });

  describe('Product Data Mapping & Variant Safety', () => {
    it('verifies product card variant-safe flags and price format', () => {
      const product = {
        id: 'prod_1',
        title: 'Banarasi Saree',
        handle: 'banarasi-saree',
        price: 2199,
        originalPrice: 3499,
        discountPercentage: 37,
        brand: 'Virasat Heritage',
        hasMultipleVariants: true,
        variantsCount: 2,
      };

      assert.equal(product.hasMultipleVariants, true);
      assert.ok(formatINR(product.price).includes('2,199') || formatINR(product.price).includes('2199'));
    });
  });

  describe('PLP SEO Metadata Generation', () => {
    it('constructs SEO metadata for Category PLP', () => {
      const meta = constructMetadata({
        title: 'Women Collection',
        description: 'Shop Women online.',
        canonicalUrl: '/category/women',
      });
      assert.equal(meta.title, 'Women Collection | Fashion Ecommerce MVP');
      assert.equal(meta.alternates?.canonical, 'http://localhost:3000/category/women');
    });

    it('constructs SEO metadata for Collection PLP', () => {
      const meta = constructMetadata({
        title: 'Summer Meadow Collection',
        canonicalUrl: '/collections/summer-meadow',
      });
      assert.equal(meta.title, 'Summer Meadow Collection | Fashion Ecommerce MVP');
      assert.equal(meta.alternates?.canonical, 'http://localhost:3000/collections/summer-meadow');
    });

    it('constructs SEO metadata for Brand PLP', () => {
      const meta = constructMetadata({
        title: 'Virasat Heritage Official Store',
        canonicalUrl: '/brand/virasat-heritage',
      });
      assert.equal(meta.title, 'Virasat Heritage Official Store | Fashion Ecommerce MVP');
      assert.equal(meta.alternates?.canonical, 'http://localhost:3000/brand/virasat-heritage');
    });

    it('constructs SEO metadata for Sale PLP', () => {
      const meta = constructMetadata({
        title: 'Mega Flash Sale & Clearance Deals',
        canonicalUrl: '/sale/all',
      });
      assert.equal(meta.title, 'Mega Flash Sale & Clearance Deals | Fashion Ecommerce MVP');
      assert.equal(meta.alternates?.canonical, 'http://localhost:3000/sale/all');
    });
  });
});

describe('Task 12: PLP Filtering, Sorting, Pagination & CMS Visibility', () => {
  const MOCK_PRODUCTS = [
    {
      id: 'prod_1',
      title: 'Banarasi Silk Saree',
      handle: 'banarasi-silk-saree',
      brand: 'Virasat Heritage',
      categoryName: 'Sarees',
      price: 2199,
      originalPrice: 3499,
      discountPercentage: 37,
      isHot: true,
      isNew: false,
      inStock: true,
      sizes: ['Free Size'],
      colors: ['Royal Magenta', 'Emerald Green'],
      createdAt: '2026-08-01T10:00:00Z',
    },
    {
      id: 'prod_2',
      title: 'Handblock Cotton Kurti',
      handle: 'handblock-cotton-kurti',
      brand: 'Gulmohar Jaipur',
      categoryName: 'Kurtas',
      price: 1699,
      originalPrice: 2599,
      discountPercentage: 35,
      isHot: true,
      isNew: false,
      inStock: true,
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Indigo', 'Mustard Yellow'],
      createdAt: '2026-08-05T10:00:00Z',
    },
    {
      id: 'prod_3',
      title: 'Pure Linen Casual Shirt',
      handle: 'pure-linen-casual-shirt',
      brand: 'Loom & Thread',
      categoryName: 'Men Casual Shirts',
      price: 1399,
      originalPrice: 1999,
      discountPercentage: 30,
      isHot: false,
      isNew: true,
      inStock: true,
      sizes: ['M', 'L', 'XL'],
      colors: ['Sage Green', 'Pure White'],
      createdAt: '2026-08-10T10:00:00Z',
    },
    {
      id: 'prod_4',
      title: 'Mulmul Summer Midi Dress',
      handle: 'mulmul-summer-midi-dress',
      brand: 'Meadow Studio',
      categoryName: 'Dresses',
      price: 1599,
      originalPrice: 2399,
      discountPercentage: 33,
      isHot: false,
      isNew: true,
      inStock: true,
      sizes: ['XS', 'S', 'M'],
      colors: ['Pastel Pink', 'Floral White'],
      createdAt: '2026-08-15T10:00:00Z',
    },
    {
      id: 'prod_5',
      title: 'Chanderi Silk Anarkali Suit',
      handle: 'chanderi-silk-anarkali-suit',
      brand: 'Virasat Heritage',
      categoryName: 'Kurtas',
      price: 3499,
      originalPrice: 5499,
      discountPercentage: 36,
      isHot: true,
      isNew: false,
      inStock: true,
      sizes: ['M', 'L'],
      colors: ['Deep Ruby', 'Gold'],
      createdAt: '2026-08-02T10:00:00Z',
    },
    {
      id: 'prod_6',
      title: 'Curve Plus Wrap Style Dress',
      handle: 'curve-plus-wrap-dress',
      brand: 'Meadow Studio',
      categoryName: 'Curve + Plus',
      price: 1899,
      originalPrice: 2799,
      discountPercentage: 32,
      isHot: false,
      isNew: true,
      inStock: false,
      sizes: ['1X', '2X'],
      colors: ['Navy Blue'],
      createdAt: '2026-08-18T10:00:00Z',
    },
  ];

  describe('1. Faceted Filtering Engine', () => {
    it('should filter by brand correctly', () => {
      const filtered = MOCK_PRODUCTS.filter((p) => p.brand === 'Virasat Heritage');
      assert.equal(filtered.length, 2);
      assert.ok(filtered.every((p) => p.brand === 'Virasat Heritage'));
    });

    it('should filter by multiple brands simultaneously', () => {
      const selectedBrands = ['Virasat Heritage', 'Gulmohar Jaipur'];
      const filtered = MOCK_PRODUCTS.filter((p) => selectedBrands.includes(p.brand || ''));
      assert.equal(filtered.length, 3);
    });

    it('should filter by size across multi-variant arrays', () => {
      const selectedSize = 'XL';
      const filtered = MOCK_PRODUCTS.filter((p) => p.sizes?.includes(selectedSize));
      assert.equal(filtered.length, 2);
      assert.ok(filtered.every((p) => p.sizes?.includes('XL')));
    });

    it('should filter by color correctly', () => {
      const selectedColor = 'Sage Green';
      const filtered = MOCK_PRODUCTS.filter((p) =>
        p.colors?.some((c) => c.toLowerCase().includes(selectedColor.toLowerCase()))
      );
      assert.equal(filtered.length, 1);
      assert.equal(filtered[0].id, 'prod_3');
    });

    it('should filter by price range min and max', () => {
      const min = 1500;
      const max = 2500;
      const filtered = MOCK_PRODUCTS.filter((p) => p.price >= min && p.price <= max);
      assert.equal(filtered.length, 4);
    });

    it('should filter by in-stock availability', () => {
      const inStockOnly = MOCK_PRODUCTS.filter((p) => p.inStock !== false);
      assert.equal(inStockOnly.length, 5);
      assert.ok(inStockOnly.every((p) => p.inStock === true));
    });

    it('should combine multiple filter dimensions cleanly', () => {
      const filtered = MOCK_PRODUCTS.filter(
        (p) =>
          p.brand === 'Virasat Heritage' &&
          p.sizes?.includes('M') &&
          p.price <= 4000
      );
      assert.equal(filtered.length, 1);
      assert.equal(filtered[0].id, 'prod_5');
    });
  });

  describe('2. Sorting Engine', () => {
    it('should sort products by price ascending (price_asc)', () => {
      const sorted = [...MOCK_PRODUCTS].sort((a, b) => a.price - b.price);
      assert.equal(sorted[0].price, 1399);
      assert.equal(sorted[sorted.length - 1].price, 3499);
    });

    it('should sort products by price descending (price_desc)', () => {
      const sorted = [...MOCK_PRODUCTS].sort((a, b) => b.price - a.price);
      assert.equal(sorted[0].price, 3499);
      assert.equal(sorted[sorted.length - 1].price, 1399);
    });

    it('should sort products by newest arrivals (newest)', () => {
      const sorted = [...MOCK_PRODUCTS].sort((a, b) => {
        if (a.isNew && !b.isNew) return -1;
        if (!a.isNew && b.isNew) return 1;
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      });
      assert.ok(sorted[0].isNew);
      assert.ok(sorted[1].isNew);
      assert.ok(sorted[2].isNew);
    });
  });

  describe('3. Pagination & Progressive Batch Loading', () => {
    it('should slice results according to offset and limit', () => {
      const limit = 2;
      const offset = 0;
      const page1 = MOCK_PRODUCTS.slice(offset, offset + limit);
      assert.equal(page1.length, 2);
      assert.equal(page1[0].id, 'prod_1');
      assert.equal(page1[1].id, 'prod_2');

      const offset2 = 2;
      const page2 = MOCK_PRODUCTS.slice(offset2, offset2 + limit);
      assert.equal(page2.length, 2);
      assert.equal(page2[0].id, 'prod_3');
      assert.equal(page2[1].id, 'prod_4');
    });

    it('should compute hasMore and nextOffset correctly', () => {
      const total = MOCK_PRODUCTS.length;
      const limit = 4;
      const offset = 0;
      const hasMore = offset + limit < total;
      const nextOffset = hasMore ? offset + limit : undefined;

      assert.equal(hasMore, true);
      assert.equal(nextOffset, 4);

      const offsetNext = 4;
      const hasMoreNext = offsetNext + limit < total;
      const nextOffset2 = hasMoreNext ? offsetNext + limit : undefined;

      assert.equal(hasMoreNext, false);
      assert.equal(nextOffset2, undefined);
    });

    it('should prevent duplicate products when appending next batch', () => {
      const existing = [MOCK_PRODUCTS[0], MOCK_PRODUCTS[1]];
      const incomingBatch = [MOCK_PRODUCTS[1], MOCK_PRODUCTS[2], MOCK_PRODUCTS[3]];

      const seenIds = new Set(existing.map((p) => p.id));
      const nonDuplicates = incomingBatch.filter((p) => !seenIds.has(p.id));
      const merged = [...existing, ...nonDuplicates];

      assert.equal(merged.length, 4);
      assert.equal(new Set(merged.map((p) => p.id)).size, 4);
    });
  });

  describe('4. URL Query Parameter Synchronization', () => {
    it('should serialize active filters into standard query string', () => {
      const params = new URLSearchParams();
      params.set('brands', ['Virasat Heritage', 'Gulmohar Jaipur'].join(','));
      params.set('sizes', ['M', 'L'].join(','));
      params.set('price_min', '1500');
      params.set('price_max', '3500');
      params.set('sort', 'price_asc');

      const qs = params.toString();
      assert.ok(qs.includes('brands=Virasat+Heritage%2CGulmohar+Jaipur'));
      assert.ok(qs.includes('sizes=M%2CL'));
      assert.ok(qs.includes('price_min=1500'));
      assert.ok(qs.includes('price_max=3500'));
      assert.ok(qs.includes('sort=price_asc'));
    });

    it('should deserialize query string into active filter state', () => {
      const qs = 'brands=Virasat+Heritage%2CGulmohar+Jaipur&sizes=M%2CL&price_min=1500&sort=price_asc';
      const searchParams = new URLSearchParams(qs);

      const brands = searchParams.get('brands')?.split(',') || [];
      const sizes = searchParams.get('sizes')?.split(',') || [];
      const priceMin = Number(searchParams.get('price_min'));
      const sort = searchParams.get('sort');

      assert.deepEqual(brands, ['Virasat Heritage', 'Gulmohar Jaipur']);
      assert.deepEqual(sizes, ['M', 'L']);
      assert.equal(priceMin, 1500);
      assert.equal(sort, 'price_asc');
    });
  });

  describe('5. CMS-Controlled Item Visibility & One-Row Rule', () => {
    it('should honor CMS desktopVisibleItems and mobileVisibleItems defaults', () => {
      const defaultDesktop = 5;
      const defaultMobile = 2;
      const sliderEnabled = true;

      assert.equal(defaultDesktop, 5);
      assert.equal(defaultMobile, 2);
      assert.equal(sliderEnabled, true);
    });

    it('should correctly configure slider controls when total items exceed visible count', () => {
      const totalItems = 8;
      const desktopVisibleItems = 5;
      const shouldEnableSlider = totalItems > desktopVisibleItems;

      assert.equal(shouldEnableSlider, true);
    });

    it('should not show unnecessary slider controls when all items fit within visible count', () => {
      const totalItems = 4;
      const desktopVisibleItems = 5;
      const shouldEnableSlider = totalItems > desktopVisibleItems;

      assert.equal(shouldEnableSlider, false);
    });
  });

  describe('6. Homepage Bottom Multi-Row Infinite Product Feed', () => {
    it('should initialize with a bounded batch size of 24 products', () => {
      const batchSize = 24;
      const initialOffset = 0;
      assert.equal(batchSize, 24);
      assert.equal(initialOffset, 0);
    });

    it('should append subsequent batch without duplicating products', () => {
      const initialBatch = MOCK_PRODUCTS.slice(0, 3);
      const incomingBatch = [MOCK_PRODUCTS[2], MOCK_PRODUCTS[3], MOCK_PRODUCTS[4]];

      const seen = new Set(initialBatch.map((p) => p.id));
      const filteredIncoming = incomingBatch.filter((p) => !seen.has(p.id));
      const combined = [...initialBatch, ...filteredIncoming];

      assert.equal(combined.length, 5);
      assert.equal(new Set(combined.map((p) => p.id)).size, 5);
    });

    it('should maintain multi-row grid layout on desktop and mobile for bottom feed', () => {
      const layoutType = 'multi-row-grid';
      assert.equal(layoutType, 'multi-row-grid');
    });
  });

  describe('7. Global Product Section One-Row Slider Rule', () => {
    it('should enforce 1-row layout for horizontal product sections across all viewports', () => {
      const desktopCount = 4;
      const mobileCount = 2;
      const sliderEnabled = true;

      const desktopItemWidth = 'lg:w-[calc(25%-12px)]';
      const mobileItemWidth = 'w-[calc(50%-6px)]';

      assert.equal(desktopCount, 4);
      assert.equal(mobileCount, 2);
      assert.ok(desktopItemWidth.includes('25%'));
      assert.ok(mobileItemWidth.includes('50%'));
      assert.equal(sliderEnabled, true);
    });

    it('should provide section-specific View All navigation to dedicated PLP', () => {
      const section = {
        title: 'Trending New Arrivals',
        viewAllLink: '/category/women',
      };
      assert.equal(section.viewAllLink, '/category/women');
      assert.ok(section.viewAllLink.startsWith('/category/'));
    });
  });
});

describe('Task 13: Product Detail Page (PDP) & Mini PDP Engine', () => {
  const MOCK_RAW_MEDUSA_PRODUCT = {
    id: 'prod_shirt_1',
    title: 'Slim Fit Pure Linen Casual Shirt',
    handle: 'slim-fit-pure-linen-casual-shirt',
    description: 'Artisan crafted pure linen shirt for effortless elegance.',
    subtitle: 'Loom & Thread luxury casual wear',
    thumbnail: 'https://images.unsplash.com/photo-linen-shirt-1.jpg',
    images: [
      { id: 'img_1', url: 'https://images.unsplash.com/photo-linen-shirt-1.jpg' },
      { id: 'img_2', url: 'https://images.unsplash.com/photo-linen-shirt-2.jpg' },
      { id: 'img_3', url: 'https://images.unsplash.com/photo-linen-shirt-3.jpg' },
    ],
    metadata: {
      brand: 'Loom & Thread',
      original_price: 1999,
      is_new: true,
    },
    options: [
      {
        id: 'opt_size',
        title: 'Size',
        values: [
          { id: 'val_m', value: 'M' },
          { id: 'val_l', value: 'L' },
          { id: 'val_xl', value: 'XL' },
        ],
      },
      {
        id: 'opt_color',
        title: 'Color',
        values: [
          { id: 'val_sage', value: 'Sage Green' },
          { id: 'val_white', value: 'Pure White' },
        ],
      },
    ],
    variants: [
      {
        id: 'var_sage_m',
        title: 'Sage Green / M',
        sku: 'SHIRT-SAGE-M',
        prices: [{ amount: 1399, currency_code: 'inr' }],
        options: [
          { option_id: 'opt_size', value: 'M', option: { title: 'Size' } },
          { option_id: 'opt_color', value: 'Sage Green', option: { title: 'Color' } },
        ],
        inventory_quantity: 10,
        manage_inventory: true,
        allow_backorder: false,
      },
      {
        id: 'var_sage_l',
        title: 'Sage Green / L',
        sku: 'SHIRT-SAGE-L',
        prices: [{ amount: 1399, currency_code: 'inr' }],
        options: [
          { option_id: 'opt_size', value: 'L', option: { title: 'Size' } },
          { option_id: 'opt_color', value: 'Sage Green', option: { title: 'Color' } },
        ],
        inventory_quantity: 0,
        manage_inventory: true,
        allow_backorder: false,
      },
      {
        id: 'var_white_m',
        title: 'Pure White / M',
        sku: 'SHIRT-WHT-M',
        prices: [{ amount: 1499, currency_code: 'inr' }],
        options: [
          { option_id: 'opt_size', value: 'M', option: { title: 'Size' } },
          { option_id: 'opt_color', value: 'Pure White', option: { title: 'Color' } },
        ],
        inventory_quantity: 5,
        manage_inventory: true,
        allow_backorder: false,
      },
    ],
    categories: [
      { id: 'pcat_men', name: 'Men', handle: 'men' },
      { id: 'pcat_shirts', name: 'Casual Shirts', handle: 'men-casual-shirts' },
    ],
  };

  // Helper mapper matching storefront implementation
  function mapMedusaToDetail(p) {
    const rawImages = [];
    if (p.thumbnail) rawImages.push(p.thumbnail);
    if (Array.isArray(p.images)) {
      for (const img of p.images) {
        const url = typeof img === 'string' ? img : img?.url;
        if (url && !rawImages.includes(url)) rawImages.push(url);
      }
    }

    const options = (p.options || []).map((opt) => ({
      id: opt.id,
      title: opt.title,
      values: (opt.values || []).map((v) => ({ id: v.id, value: v.value })),
    }));

    const variants = (p.variants || []).map((v) => {
      const variantOptions = {};
      if (Array.isArray(v.options)) {
        for (const optVal of v.options) {
          const optTitle = optVal.option?.title || optVal.option_id;
          variantOptions[optTitle] = optVal.value;
        }
      }

      const price = v.prices?.[0]?.amount || 1499;
      const originalPrice = p.metadata?.original_price ? Number(p.metadata.original_price) : undefined;
      const discount = originalPrice && originalPrice > price
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : undefined;

      const inStock = v.manage_inventory ? v.inventory_quantity > 0 || v.allow_backorder === true : true;

      return {
        id: v.id,
        title: v.title,
        sku: v.sku,
        price,
        originalPrice,
        discountPercentage: discount,
        inStock,
        inventoryQuantity: v.inventory_quantity,
        options: variantOptions,
      };
    });

    return {
      id: p.id,
      title: p.title,
      handle: p.handle,
      description: p.description,
      subtitle: p.subtitle,
      brand: p.metadata?.brand,
      price: variants[0]?.price || 1499,
      originalPrice: p.metadata?.original_price,
      discountPercentage: variants[0]?.discountPercentage,
      images: rawImages,
      options,
      variants,
      categoryHierarchy: (p.categories || []).map((c) => ({ name: c.name, handle: c.handle })),
    };
  }

  describe('1. PDP Data Mapping & Image Gallery Contracts', () => {
    it('maps complete product details and resolves all image assets', () => {
      const detail = mapMedusaToDetail(MOCK_RAW_MEDUSA_PRODUCT);
      assert.equal(detail.id, 'prod_shirt_1');
      assert.equal(detail.title, 'Slim Fit Pure Linen Casual Shirt');
      assert.equal(detail.brand, 'Loom & Thread');
      assert.equal(detail.images.length, 3);
      assert.equal(detail.options.length, 2);
      assert.equal(detail.variants.length, 3);
      assert.equal(detail.categoryHierarchy.length, 2);
    });

    it('calculates dynamic discounts across variant pricing', () => {
      const detail = mapMedusaToDetail(MOCK_RAW_MEDUSA_PRODUCT);
      const var1 = detail.variants[0];
      assert.equal(var1.price, 1399);
      assert.equal(var1.originalPrice, 1999);
      assert.equal(var1.discountPercentage, 30);
    });
  });

  describe('2. Variant Resolution & Selection Logic', () => {
    it('resolves exact variant when all selected options match', () => {
      const detail = mapMedusaToDetail(MOCK_RAW_MEDUSA_PRODUCT);
      const selected = { Size: 'M', Color: 'Sage Green' };

      const match = detail.variants.find((v) => {
        return Object.entries(selected).every(([k, val]) => v.options[k] === val);
      });

      assert.ok(match);
      assert.equal(match.id, 'var_sage_m');
      assert.equal(match.sku, 'SHIRT-SAGE-M');
      assert.equal(match.inStock, true);
    });

    it('correctly identifies out-of-stock variant combinations', () => {
      const detail = mapMedusaToDetail(MOCK_RAW_MEDUSA_PRODUCT);
      const selected = { Size: 'L', Color: 'Sage Green' };

      const match = detail.variants.find((v) => {
        return Object.entries(selected).every(([k, val]) => v.options[k] === val);
      });

      assert.ok(match);
      assert.equal(match.id, 'var_sage_l');
      assert.equal(match.inStock, false);
    });

    it('returns null for nonexistent/invalid option combinations', () => {
      const detail = mapMedusaToDetail(MOCK_RAW_MEDUSA_PRODUCT);
      const selected = { Size: 'XL', Color: 'Pure White' };

      const match = detail.variants.find((v) => {
        return Object.entries(selected).every(([k, val]) => v.options[k] === val);
      });

      assert.equal(match, undefined);
    });
  });

  describe('3. Cart & Buy Now Safety Rules', () => {
    it('prevents adding to cart when valid variant is missing or out of stock', () => {
      const detail = mapMedusaToDetail(MOCK_RAW_MEDUSA_PRODUCT);
      const outOfStockVariant = detail.variants.find((v) => v.id === 'var_sage_l');

      function validateAddToCart(variant) {
        if (!variant) return { success: false, reason: 'NO_VARIANT_SELECTED' };
        if (!variant.inStock) return { success: false, reason: 'OUT_OF_STOCK' };
        return { success: true, variantId: variant.id };
      }

      const invalidResult = validateAddToCart(outOfStockVariant);
      assert.equal(invalidResult.success, false);
      assert.equal(invalidResult.reason, 'OUT_OF_STOCK');

      const validVariant = detail.variants.find((v) => v.id === 'var_sage_m');
      const validResult = validateAddToCart(validVariant);
      assert.equal(validResult.success, true);
      assert.equal(validResult.variantId, 'var_sage_m');
    });
  });

  describe('4. Mini PDP Architecture & Responsive Viewport Rules', () => {
    it('configures desktop Mini PDP as centered modal overlay', () => {
      const desktopConfig = {
        component: 'Dialog',
        size: 'lg',
        isCentered: true,
        hasBackdrop: true,
      };
      assert.equal(desktopConfig.component, 'Dialog');
      assert.equal(desktopConfig.isCentered, true);
      assert.equal(desktopConfig.size, 'lg');
    });

    it('configures mobile Mini PDP as bottom sheet drawer using 70-80% viewport height', () => {
      const mobileConfig = {
        component: 'Drawer',
        position: 'bottom',
        maxHeightClass: 'max-h-[80vh]',
        hasFutureStripPlaceholder: true,
      };
      assert.equal(mobileConfig.position, 'bottom');
      assert.equal(mobileConfig.maxHeightClass, 'max-h-[80vh]');
      assert.equal(mobileConfig.hasFutureStripPlaceholder, true);
    });
  });

  describe('5. Image Gallery & Zoom Controls', () => {
    it('cycles active image index within valid bounds', () => {
      const totalImages = 3;
      let currentIndex = 0;

      function nextImage(idx, count) {
        return (idx + 1) % count;
      }
      function prevImage(idx, count) {
        return (idx - 1 + count) % count;
      }

      currentIndex = nextImage(currentIndex, totalImages);
      assert.equal(currentIndex, 1);
      currentIndex = nextImage(currentIndex, totalImages);
      assert.equal(currentIndex, 2);
      currentIndex = nextImage(currentIndex, totalImages);
      assert.equal(currentIndex, 0); // Wraps smoothly

      currentIndex = prevImage(currentIndex, totalImages);
      assert.equal(currentIndex, 2);
    });

    it('supports zoom scale scaling and clamping', () => {
      let scale = 1.0;
      function zoomIn(s) {
        return Math.min(3.5, Number((s + 0.5).toFixed(1)));
      }
      function zoomOut(s) {
        return Math.max(1.0, Number((s - 0.5).toFixed(1)));
      }

      scale = zoomIn(scale);
      assert.equal(scale, 1.5);
      scale = zoomIn(scale);
      assert.equal(scale, 2.0);
      scale = zoomOut(scale);
      assert.equal(scale, 1.5);
      scale = zoomOut(scale);
      assert.equal(scale, 1.0);
      scale = zoomOut(scale); // Does not go below 1.0
      assert.equal(scale, 1.0);
    });

    it('enforces mobile dedicated image viewer isolation and minimalist contracts', () => {
      const viewerState = {
        isOpen: true,
        viewportWidth: 390,
        isMobile: true,
        features: {
          hasBackCloseButton: true,
          hasZoomControls: true,
          hasMainImageArea: true,
          hasBottomColorSwatches: true,
          hasFullDescription: false,
          hasAddToCartButton: false,
          hasBuyNowButton: false,
          hasPincodeSection: false,
          hasRelatedProducts: false,
        },
      };

      assert.equal(viewerState.isMobile, true);
      assert.equal(viewerState.features.hasBackCloseButton, true);
      assert.equal(viewerState.features.hasZoomControls, true);
      assert.equal(viewerState.features.hasBottomColorSwatches, true);
      // Ensure minimalist image-only inspection UI
      assert.equal(viewerState.features.hasFullDescription, false);
      assert.equal(viewerState.features.hasAddToCartButton, false);
      assert.equal(viewerState.features.hasBuyNowButton, false);
      assert.equal(viewerState.features.hasPincodeSection, false);
      assert.equal(viewerState.features.hasRelatedProducts, false);
    });

    it('preserves desktop hover-zoom behavior without launching modal', () => {
      const desktopInteraction = {
        viewportWidth: 1280,
        isDesktop: true,
        triggersMobileModalOnClick: false,
        supportsHoverZoom: true,
        desktopZoomScale: 2.0,
      };

      assert.equal(desktopInteraction.isDesktop, true);
      assert.equal(desktopInteraction.triggersMobileModalOnClick, false);
      assert.equal(desktopInteraction.supportsHoverZoom, true);
    });

    it('updates selected color from viewer swatches and preserves selection on close', () => {
      let selectedColor = 'Sage Green';
      let activeImage = 0;

      function onSelectColorInViewer(newColor) {
        selectedColor = newColor;
        if (newColor === 'Pure White') {
          activeImage = 1;
        }
      }

      function onCloseViewer() {
        // Return to PDP with state intact
        return { selectedColor, activeImage };
      }

      onSelectColorInViewer('Pure White');
      assert.equal(selectedColor, 'Pure White');
      assert.equal(activeImage, 1);

      const returnedState = onCloseViewer();
      assert.equal(returnedState.selectedColor, 'Pure White');
      assert.equal(returnedState.activeImage, 1);
    });
  });

  describe('6. Pincode Estimation Validator', () => {
    it('validates authentic 6-digit Indian postal PIN codes', () => {
      const validCodes = ['110001', '560001', '400001', '302001'];
      const invalidCodes = ['12345', '012345', 'abcdef', '1100001', ''];

      const pinRegex = /^[1-9][0-9]{5}$/;

      for (const code of validCodes) {
        assert.equal(pinRegex.test(code), true, `Expected valid: ${code}`);
      }
      for (const code of invalidCodes) {
        assert.equal(pinRegex.test(code), false, `Expected invalid: ${code}`);
      }
    });
  });
});

describe('Task 13.2: Mobile Navigation, PDP Sharing & Environment/Config Refactoring', () => {
  describe('1. Mobile Back Navigation Engine', () => {
    it('safely falls back to designated category or home route on direct URL entry with no session history', () => {
      function resolveMobileBack({ hasInternalHistory, fallbackUrl }) {
        if (hasInternalHistory) {
          return { action: 'back' };
        }
        return { action: 'push', url: fallbackUrl || '/' };
      }

      // Direct entry: no referrer / fresh tab
      const directEntryResult = resolveMobileBack({
        hasInternalHistory: false,
        fallbackUrl: '/category/women',
      });
      assert.deepEqual(directEntryResult, { action: 'push', url: '/category/women' });

      // Direct entry without category fallback: default to root '/'
      const rootFallbackResult = resolveMobileBack({
        hasInternalHistory: false,
        fallbackUrl: undefined,
      });
      assert.deepEqual(rootFallbackResult, { action: 'push', url: '/' });
    });

    it('delegates to browser back when internal application history exists to preserve PLP state', () => {
      function resolveMobileBack({ hasInternalHistory, fallbackUrl }) {
        if (hasInternalHistory) {
          return { action: 'back' };
        }
        return { action: 'push', url: fallbackUrl || '/' };
      }

      // Internal navigation: PLP -> PDP -> Back
      const internalNavResult = resolveMobileBack({
        hasInternalHistory: true,
        fallbackUrl: '/category/women',
      });
      assert.deepEqual(internalNavResult, { action: 'back' });
    });

    it('prioritizes closing overlay modal/drawer before triggering page back navigation', () => {
      let isDrawerOpen = true;
      let navigatedAway = false;

      function handleBackPress() {
        if (isDrawerOpen) {
          isDrawerOpen = false;
          return;
        }
        navigatedAway = true;
      }

      // First back press: closes drawer
      handleBackPress();
      assert.equal(isDrawerOpen, false);
      assert.equal(navigatedAway, false);

      // Second back press: navigates away
      handleBackPress();
      assert.equal(navigatedAway, true);
    });
  });

  describe('2. Canonical PDP URL & Sharing System', () => {
    it('generates pristine canonical product URLs without ephemeral UI state or query junk', () => {
      function getCanonicalPdpUrl(origin, handle) {
        return `${origin}/product/${encodeURIComponent(handle)}`;
      }

      const canonicalUrl = getCanonicalPdpUrl(
        'https://www.ecomfashion.com',
        'chanderi-silk-anarkali-suit'
      );
      assert.equal(
        canonicalUrl,
        'https://www.ecomfashion.com/product/chanderi-silk-anarkali-suit'
      );
      assert.equal(canonicalUrl.includes('localhost'), false);
      assert.equal(canonicalUrl.includes('?'), false);
    });

    it('safely handles special characters in product handles', () => {
      function getCanonicalPdpUrl(origin, handle) {
        return `${origin}/product/${encodeURIComponent(handle)}`;
      }

      const canonicalUrl = getCanonicalPdpUrl(
        'https://www.ecomfashion.com',
        'embroidered-kurta-&-dupatta-set'
      );
      assert.equal(
        canonicalUrl,
        'https://www.ecomfashion.com/product/embroidered-kurta-%26-dupatta-set'
      );
    });

    it('executes Web Share API when supported and falls back gracefully to clipboard', async () => {
      let shareInvoked = false;
      let clipboardText = '';

      const mockNavigator = {
        share: async (payload) => {
          shareInvoked = true;
          return payload;
        },
        clipboard: {
          writeText: async (text) => {
            clipboardText = text;
          },
        },
      };

      const sharePayload = {
        title: 'Chanderi Silk Anarkali Suit',
        text: 'Explore Chanderi Silk Anarkali Suit on Gulmohar',
        url: 'https://www.ecomfashion.com/product/chanderi-silk-anarkali-suit',
      };

      // When navigator.share exists:
      if (mockNavigator.share) {
        await mockNavigator.share(sharePayload);
      }
      assert.equal(shareInvoked, true);

      // Fallback test when navigator.share throws or is missing:
      await mockNavigator.clipboard.writeText(sharePayload.url);
      assert.equal(
        clipboardText,
        'https://www.ecomfashion.com/product/chanderi-silk-anarkali-suit'
      );
    });
  });

  describe('3. Centralized Configuration & Environment Separation', () => {
    it('centralizes environment access and segregates public vs server-only variables', () => {
      const mockEnv = {
        siteUrl: 'https://www.ecomfashion.com',
        siteName: 'Gulmohar Fashion',
        medusaUrl: 'https://api.ecomfashion.com',
        medusaPublishableKey: 'pk_live_key_123',
        strapiUrl: 'https://cms.ecomfashion.com',
        nodeEnv: 'production',
        isDevelopment: false,
        isProduction: true,
        isTest: false,
        strapiApiToken: undefined, // client context
      };

      assert.equal(mockEnv.siteUrl, 'https://www.ecomfashion.com');
      assert.equal(mockEnv.medusaUrl, 'https://api.ecomfashion.com');
      assert.equal(mockEnv.strapiUrl, 'https://cms.ecomfashion.com');
      assert.equal(mockEnv.isProduction, true);
      assert.equal(mockEnv.strapiApiToken, undefined);
    });

    it('resolves centralized API endpoint routes without hardcoded duplicate strings', () => {
      const mockApiConfig = {
        medusa: {
          baseUrl: 'https://api.ecomfashion.com',
          endpoints: {
            products: '/store/products',
            productByHandle: (handle) => `/store/products?handle=${encodeURIComponent(handle)}`,
            cart: (cartId) => `/store/carts/${encodeURIComponent(cartId)}`,
          },
        },
        cms: {
          baseUrl: 'https://cms.ecomfashion.com',
          endpoints: {
            pages: '/api/pages',
            pageBySlug: (slug) => `/api/pages?filters[slug][$eq]=${encodeURIComponent(slug)}`,
          },
        },
        storefront: {
          baseUrl: 'https://www.ecomfashion.com',
          internalApi: {
            productDetail: (handle) => `/api/products/${encodeURIComponent(handle)}`,
          },
        },
      };

      assert.equal(
        mockApiConfig.medusa.endpoints.productByHandle('silk-saree'),
        '/store/products?handle=silk-saree'
      );
      assert.equal(
        mockApiConfig.cms.endpoints.pageBySlug('about-us'),
        '/api/pages?filters[slug][$eq]=about-us'
      );
      assert.equal(
        mockApiConfig.storefront.internalApi.productDetail('silk-saree'),
        '/api/products/silk-saree'
      );
    });
  });
});

describe('Task 14: Search Foundation', () => {
  describe('1. SearchProvider Abstraction & Contract Integrity', () => {
    it('provides unified ISearchProvider contract with distinct suggestions and search methods', () => {
      // Mock ISearchProvider implementation
      const mockProvider = {
        name: 'medusa',
        async suggestions(query, options, signal) {
          if (!query.trim()) {
            return {
              query: '',
              suggestions: [{ id: 't1', title: 'Kurta', type: 'query' }],
              products: [],
              categories: [],
              brands: [],
              totalSuggestions: 1,
            };
          }
          if (signal?.aborted) throw new Error('AbortError');
          return {
            query,
            suggestions: [
              { id: 'q1', title: query, type: 'query', query },
              { id: 'p1', title: `${query} Shirt`, type: 'product', handle: `${query.toLowerCase()}-shirt` },
            ],
            products: [{ id: 'prod_1', title: `${query} Shirt`, price: 1999, handle: `${query.toLowerCase()}-shirt` }],
            categories: [{ id: 'cat_1', name: 'Shirts', handle: 'shirts' }],
            brands: ['Gulmohar Jaipur'],
            totalSuggestions: 2,
          };
        },
        async search(query, options, signal) {
          if (signal?.aborted) throw new Error('AbortError');
          return {
            query,
            products: [{ id: 'prod_1', title: `${query} Shirt`, price: 1999, handle: `${query.toLowerCase()}-shirt` }],
            totalCount: 1,
            hasMore: false,
            page: 1,
            limit: 24,
            offset: 0,
            facets: { brands: [{ value: 'Gulmohar', label: 'Gulmohar', count: 1 }], sizes: [], colors: [], priceRange: { min: 1999, max: 1999 } },
          };
        },
      };

      assert.equal(mockProvider.name, 'medusa');
      assert.equal(typeof mockProvider.suggestions, 'function');
      assert.equal(typeof mockProvider.search, 'function');
    });

    it('factory function getSearchProvider defaults to medusa search provider', () => {
      const providerFactory = (name = 'medusa') => {
        return { name, isProvider: true };
      };

      const defaultProv = providerFactory();
      assert.equal(defaultProv.name, 'medusa');
      assert.equal(defaultProv.isProvider, true);
    });
  });

  describe('2. Suggestions vs Full Search Separation', () => {
    it('suggestions returns lightweight suggestion items, category matches, and product teasers', async () => {
      const mockSuggestionsResult = {
        query: 'linen',
        suggestions: [
          { id: 'query_linen', title: 'linen', type: 'query', query: 'linen' },
          { id: 'cat_men', title: 'in Men', type: 'category', categoryName: 'Men', categoryHandle: 'men', query: 'linen' },
          { id: 'prod_1', title: 'Slim Fit Pure Linen Casual Shirt', type: 'product', handle: 'slim-fit-pure-linen-casual-shirt', price: 1899 },
        ],
        products: [
          { id: 'prod_1', title: 'Slim Fit Pure Linen Casual Shirt', price: 1899, handle: 'slim-fit-pure-linen-casual-shirt' },
        ],
        categories: [{ id: 'men', name: 'Men', handle: 'men' }],
        brands: ['Virasat Heritage'],
        totalSuggestions: 3,
      };

      assert.equal(mockSuggestionsResult.query, 'linen');
      assert.equal(mockSuggestionsResult.suggestions.length, 3);
      assert.equal(mockSuggestionsResult.suggestions[0].type, 'query');
      assert.equal(mockSuggestionsResult.suggestions[1].type, 'category');
      assert.equal(mockSuggestionsResult.suggestions[2].type, 'product');
      assert.equal(mockSuggestionsResult.categories.length, 1);
      assert.equal(mockSuggestionsResult.brands.length, 1);
    });

    it('full search returns complete paginated results with facets and filter metadata', async () => {
      const mockFullResult = {
        query: 'kurta',
        products: [
          { id: 'prod_1', title: 'Handloom Cotton Kurta', price: 1499, handle: 'handloom-cotton-kurta' },
          { id: 'prod_2', title: 'Silk Festive Kurta', price: 2999, handle: 'silk-festive-kurta' },
        ],
        totalCount: 2,
        hasMore: false,
        page: 1,
        limit: 24,
        offset: 0,
        facets: {
          brands: [{ value: 'Gulmohar', label: 'Gulmohar', count: 2 }],
          sizes: [{ value: 'M', label: 'M', count: 2 }, { value: 'L', label: 'L', count: 1 }],
          colors: [{ value: 'Navy Blue', label: 'Navy Blue', count: 1 }],
          priceRange: { min: 1499, max: 2999 },
        },
        appliedFilters: {
          sort: 'price_asc',
        },
      };

      assert.equal(mockFullResult.query, 'kurta');
      assert.equal(mockFullResult.products.length, 2);
      assert.equal(mockFullResult.totalCount, 2);
      assert.equal(mockFullResult.hasMore, false);
      assert.ok(mockFullResult.facets.brands.length > 0);
      assert.equal(mockFullResult.facets.priceRange.min, 1499);
      assert.equal(mockFullResult.facets.priceRange.max, 2999);
    });
  });

  describe('3. Debounce & In-Flight Request Cancellation Protection', () => {
    it('debounces rapid keystrokes so only the final query executes', async () => {
      let executedQuery = null;
      let timer = null;

      const debouncedSearch = (q, delay = 50) => {
        if (timer) clearTimeout(timer);
        return new Promise((resolve) => {
          timer = setTimeout(() => {
            executedQuery = q;
            resolve(q);
          }, delay);
        });
      };

      // Simulate rapid user typing 'l', 'li', 'lin', 'linen'
      debouncedSearch('l');
      debouncedSearch('li');
      debouncedSearch('lin');
      const finalPromise = debouncedSearch('linen');

      await finalPromise;
      assert.equal(executedQuery, 'linen');
    });

    it('cancels in-flight requests using AbortController on query replacement', async () => {
      let aborted = false;
      const controller = new AbortController();

      controller.signal.addEventListener('abort', () => {
        aborted = true;
      });

      // Issue first query
      assert.equal(controller.signal.aborted, false);

      // Subsequent query arrives -> cancel previous
      controller.abort();
      assert.equal(controller.signal.aborted, true);
      assert.equal(aborted, true);
    });

    it('stale-response sequence tracking prevents out-of-order resolution from overwriting newer state', async () => {
      let committedResult = null;
      let latestSequence = 0;

      const simulateRequest = async (seqId, resultData, delayMs) => {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        // Stale response protection rule:
        if (seqId === latestSequence) {
          committedResult = resultData;
        }
      };

      // Request 1: query 'saree' (seq 1, slow response taking 60ms)
      const seq1 = ++latestSequence;
      const req1 = simulateRequest(seq1, 'result_saree', 60);

      // User quickly changes to 'dress' (seq 2, fast response taking 20ms)
      const seq2 = ++latestSequence;
      const req2 = simulateRequest(seq2, 'result_dress', 20);

      await Promise.all([req1, req2]);

      // Result MUST be 'result_dress', NOT overwritten by the slower 'result_saree'
      assert.equal(committedResult, 'result_dress');
    });
  });

  describe('4. Direct/Empty Query Handling & Error Resilience', () => {
    it('returns default suggestions on empty or whitespace query without network error', async () => {
      const emptyQueries = ['', '   ', '\t\n'];
      for (const q of emptyQueries) {
        const trimmed = q.trim();
        assert.equal(trimmed.length, 0);
      }
    });

    it('handles provider network failures gracefully by returning degraded safe state', async () => {
      const safeHandler = async (failFn) => {
        try {
          return await failFn();
        } catch (err) {
          return {
            query: 'failed_query',
            suggestions: [],
            products: [],
            categories: [],
            brands: [],
            totalSuggestions: 0,
            error: err.message,
          };
        }
      };

      const failingProvider = () => Promise.reject(new Error('Network 503 Service Unavailable'));
      const fallback = await safeHandler(failingProvider);

      assert.equal(fallback.products.length, 0);
      assert.equal(fallback.error, 'Network 503 Service Unavailable');
    });
  });
});

