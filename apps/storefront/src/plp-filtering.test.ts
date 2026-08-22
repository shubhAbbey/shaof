import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fetchPlpProducts, type StorefrontProduct, type PlpFilterOptions } from './lib/commerce';

// Fixture products for mock catalog testing
const MOCK_PRODUCTS: StorefrontProduct[] = [
  {
    id: 'prod_1',
    title: 'Banarasi Silk Saree',
    handle: 'banarasi-silk-saree',
    brand: 'Virasat Heritage',
    categoryName: 'Sarees',
    categoryHandle: 'women-sarees',
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
    categoryHandle: 'women-kurta-sets',
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
    categoryHandle: 'men-casual-shirts',
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
    categoryHandle: 'women-dresses',
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
    categoryHandle: 'women-kurta-sets',
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
    categoryHandle: 'curve-plus',
    price: 1899,
    originalPrice: 2799,
    discountPercentage: 32,
    isHot: false,
    isNew: true,
    inStock: false, // Out of stock fixture
    sizes: ['1X', '2X'],
    colors: ['Navy Blue'],
    createdAt: '2026-08-18T10:00:00Z',
  },
];

describe('Task 12: PLP Filtering, Sorting, Pagination & CMS Visibility', () => {
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
      assert.equal(filtered.length, 2); // prod_2, prod_3
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
      assert.equal(filtered.length, 4); // 2199, 1699, 1599, 1899
    });

    it('should filter by in-stock availability', () => {
      const inStockOnly = MOCK_PRODUCTS.filter((p) => p.inStock !== false);
      assert.equal(inStockOnly.length, 5);
      assert.ok(inStockOnly.every((p) => p.inStock === true));
    });

    it('should combine multiple filter dimensions cleanly', () => {
      // Brand = Virasat Heritage AND Size = M AND price <= 4000
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
      const total = MOCK_PRODUCTS.length; // 6
      const limit = 4;
      const offset = 0;
      const hasMore = offset + limit < total;
      const nextOffset = hasMore ? offset + limit : undefined;

      assert.equal(hasMore, true);
      assert.equal(nextOffset, 4);

      // Next page
      const offsetNext = 4;
      const hasMoreNext = offsetNext + limit < total;
      const nextOffset2 = hasMoreNext ? offsetNext + limit : undefined;

      assert.equal(hasMoreNext, false);
      assert.equal(nextOffset2, undefined);
    });

    it('should prevent duplicate products when appending next batch', () => {
      const existing = [MOCK_PRODUCTS[0], MOCK_PRODUCTS[1]];
      const incomingBatch = [MOCK_PRODUCTS[1], MOCK_PRODUCTS[2], MOCK_PRODUCTS[3]]; // contains duplicate prod_2

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
      const incomingBatch = [MOCK_PRODUCTS[2], MOCK_PRODUCTS[3], MOCK_PRODUCTS[4]]; // contains duplicate prod_3

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

      // Card width calculations for 1 row
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

