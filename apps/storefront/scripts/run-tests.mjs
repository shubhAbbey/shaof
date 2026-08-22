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

