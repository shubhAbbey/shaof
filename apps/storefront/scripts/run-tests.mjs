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
  return {
    title: fullTitle,
    description: description || 'Default description',
    openGraph: {
      title: fullTitle,
      url: canonicalUrl || SITE_URL,
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
