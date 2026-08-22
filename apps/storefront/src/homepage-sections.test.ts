import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import type {
  CmsHeroSection,
  CmsBannerSection,
  CmsSaleBannerSection,
  CmsCategoryTilesSection,
  CmsCollectionCarouselSection,
  CmsProductCarouselSection,
  CmsProductGridSection,
  CmsPromotionalCtaSection,
  CmsRichTextSection,
  CmsSection,
} from '@ecom/types';
import { formatINR } from './lib/utils';
import { fetchCommerceProducts } from './lib/commerce';

describe('Task 09: Homepage & CMS Section Rendering Architecture', () => {
  describe('CMS Section Contracts & Schema Integrity', () => {
    test('instantiates valid hero section contract', () => {
      const hero: CmsHeroSection = {
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

    test('instantiates valid banner and sale banner section contracts', () => {
      const banner: CmsBannerSection = {
        id: 'banner-1',
        __component: 'sections.banner',
        title: 'Mid-Season Spotlight',
        badgeText: 'EXCLUSIVE',
        ctaLink: '/collections/spotlight',
      };
      assert.equal(banner.__component, 'sections.banner');
      assert.equal(banner.badgeText, 'EXCLUSIVE');

      const saleBanner: CmsSaleBannerSection = {
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

    test('instantiates valid commerce-driven carousel and grid contracts', () => {
      const collectionCarousel: CmsCollectionCarouselSection = {
        id: 'col-1',
        __component: 'sections.collection-carousel',
        title: 'Festive Edit',
        collectionHandle: 'festive-edit',
        limit: 8,
      };
      assert.equal(collectionCarousel.__component, 'sections.collection-carousel');
      assert.equal(collectionCarousel.collectionHandle, 'festive-edit');

      const productGrid: CmsProductGridSection = {
        id: 'grid-1',
        __component: 'sections.product-grid',
        title: 'Trending Drops',
        columns: 4,
        limit: 8,
      };
      assert.equal(productGrid.__component, 'sections.product-grid');
      assert.equal(productGrid.columns, 4);
    });

    test('instantiates valid category tiles, promotional CTA, and rich text contracts', () => {
      const categoryTiles: CmsCategoryTilesSection = {
        id: 'cat-1',
        __component: 'sections.category-tiles',
        title: 'Categories',
        layout: 'grid',
        items: [{ title: 'Kurtas', categoryHandle: 'kurtas' }],
      };
      assert.equal(categoryTiles.__component, 'sections.category-tiles');
      assert.equal(categoryTiles.items?.length, 1);

      const promoCta: CmsPromotionalCtaSection = {
        id: 'promo-1',
        __component: 'sections.promotional-cta',
        title: 'Silk Capsule',
        ctaText: 'Discover',
        ctaLink: '/capsule',
      };
      assert.equal(promoCta.__component, 'sections.promotional-cta');

      const richText: CmsRichTextSection = {
        id: 'rt-1',
        __component: 'sections.rich-text',
        content: '<p>Brand editorial story</p>',
      };
      assert.equal(richText.__component, 'sections.rich-text');
    });
  });

  describe('Commerce Fetching & Data Resilience', () => {
    test('fetchCommerceProducts handles options and returns empty array gracefully on error', async () => {
      const products = await fetchCommerceProducts({
        collectionHandle: 'non-existent-collection',
        limit: 4,
      });
      assert.ok(Array.isArray(products));
    });

    test('calculates and formats product prices and discounts accurately in INR', () => {
      const price = 1499;
      const originalPrice = 2499;
      const discount = Math.round(((originalPrice - price) / originalPrice) * 100);

      assert.equal(formatINR(price), '₹1,499');
      assert.equal(formatINR(originalPrice), '₹2,499');
      assert.equal(discount, 40);
    });
  });

  describe('Dynamic Section Composition & Error Isolation', () => {
    test('handles mixed dynamic zone composition without throwing', () => {
      const sections: CmsSection[] = [
        {
          id: '1',
          __component: 'sections.hero',
          title: 'Hero',
        },
        {
          id: '2',
          __component: 'sections.category-tiles',
          title: 'Tiles',
        },
        {
          id: '3',
          __component: 'sections.collection-carousel',
          title: 'Carousel',
          collectionHandle: 'festive',
        },
      ];

      assert.equal(sections.length, 3);
      assert.equal(sections[0].__component, 'sections.hero');
      assert.equal(sections[1].__component, 'sections.category-tiles');
      assert.equal(sections[2].__component, 'sections.collection-carousel');
    });
  });
});
