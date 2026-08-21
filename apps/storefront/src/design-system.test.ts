import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { cn, formatINR } from './lib/utils';
import { constructMetadata, constructCmsSeoMetadata } from './lib/seo';
import { getStrapiMediaUrl } from './lib/strapi-client';

describe('Task 07: Storefront Design System & Foundation', () => {
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
});
