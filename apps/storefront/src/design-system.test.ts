import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { cn, formatINR } from './lib/utils';
import { constructMetadata, constructCmsSeoMetadata } from './lib/seo';
import { getStrapiMediaUrl } from './lib/strapi-client';
import { NAVIGATION_CATEGORIES } from './data/navigation';

describe('Task 08: Storefront Header & Navigation Architecture', () => {
  describe('Utilities & Formatters', () => {
    it('cn merges tailwind and conditional classes cleanly', () => {
      const result = cn('bg-red-500', false && 'hidden', true && 'text-white', 'p-4');
      assert.equal(result, 'bg-red-500 text-white p-4');
    });

    it('formatINR formats currency in Indian Rupees without decimal cents', () => {
      const formatted = formatINR(1499);
      assert.ok(formatted.includes('1,499') || formatted.includes('1499'));
      assert.ok(formatted.includes('₹') || formatted.includes('INR'));
    });
  });

  describe('SEO & Metadata Foundation', () => {
    it('constructs default metadata properly', () => {
      const meta = constructMetadata({ title: 'Summer Collection' });
      assert.equal(meta.title, 'Summer Collection | Fashion Ecommerce MVP');
      assert.ok(meta.description);
      assert.equal(meta.openGraph?.title, 'Summer Collection | Fashion Ecommerce MVP');
      if (meta.robots && typeof meta.robots === 'object') {
        assert.equal(meta.robots.index, true);
      }
    });

    it('constructs CMS SEO metadata from CmsSeoDto', () => {
      const cmsSeo = {
        metaTitle: 'Ethnic Fest 2026',
        metaDescription: 'Shop ethnic fashion items.',
        preventIndexing: false,
        shareImage: { url: 'https://cdn.example.com/share.jpg' },
      };

      const meta = constructCmsSeoMetadata(cmsSeo);
      assert.equal(meta.title, 'Ethnic Fest 2026 | Fashion Ecommerce MVP');
      assert.equal(meta.description, 'Shop ethnic fashion items.');
    });
  });

  describe('Strapi & Media Client Helpers', () => {
    it('getStrapiMediaUrl prepends base URL for relative media paths', () => {
      const relative = getStrapiMediaUrl('/uploads/image.png');
      assert.ok(relative.endsWith('/uploads/image.png'));

      const absolute = getStrapiMediaUrl('https://s3.aws.com/image.png');
      assert.equal(absolute, 'https://s3.aws.com/image.png');
    });
  });

  describe('Category Navigation & Mega Menu Structure', () => {
    it('provides all 7 core fashion navigation categories', () => {
      assert.ok(Array.isArray(NAVIGATION_CATEGORIES));
      assert.equal(NAVIGATION_CATEGORIES.length, 7);

      const handles = NAVIGATION_CATEGORIES.map((c) => c.handle);
      assert.deepEqual(handles, [
        'women',
        'men',
        'curve-plus',
        'kids',
        'home-living',
        'beauty',
        'sale',
      ]);
    });

    it('validates Women mega-menu contains Ethnic, Western, Festive, and Featured highlights', () => {
      const women = NAVIGATION_CATEGORIES.find((c) => c.handle === 'women');
      assert.ok(women);
      assert.ok(women.groups.length >= 4);

      const groupTitles = women.groups.map((g) => g.title);
      assert.ok(groupTitles.includes('Ethnic Wear'));
      assert.ok(groupTitles.includes('Western Wear'));
      assert.ok(groupTitles.includes('Festive & Occasion'));

      assert.ok(women.featured && women.featured.length > 0);
      assert.ok(women.featured[0].title);
      assert.ok(women.featured[0].href);
    });

    it('validates Sale category has prominent promotional deals', () => {
      const sale = NAVIGATION_CATEGORIES.find((c) => c.handle === 'sale');
      assert.ok(sale);
      assert.equal(sale.badge, 'UP TO 70%');
      assert.ok(sale.groups.length >= 2);
    });
  });
});
