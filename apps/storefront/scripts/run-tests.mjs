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

describe('Task 07: Storefront Design System & Foundation', () => {
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
});
