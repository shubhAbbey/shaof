import React from 'react';
import type { Metadata } from 'next';
import { fetchCmsPage } from '../lib/strapi-client';
import { SectionRenderer } from '../components/sections';
import { HomepageProductFeed } from '../components/home/homepage-product-feed';
import { fetchPlpProducts } from '../lib/commerce';
import type { CmsPageDto, CmsSection } from '@ecom/types';

export const revalidate = 60; // ISR revalidation every 60 seconds

const DEFAULT_HOMEPAGE_SECTIONS: CmsSection[] = [
  {
    id: 'hero-1',
    __component: 'sections.hero',
    title: 'Timeless Elegance, Modern Silhouettes',
    subtitle: 'Explore our handcrafted collection of festive Indian wear, everyday westerns, and contemporary fusion styles.',
    ctaText: 'Shop New Season',
    ctaLink: '/category/women',
    textAlignment: 'left',
  },
  {
    id: 'category-tiles-1',
    __component: 'sections.category-tiles',
    title: 'Explore by Category',
    subtitle: 'Handpicked styles curated for every occasion',
    layout: 'grid',
    desktopVisibleItems: 6,
    mobileVisibleItems: 2,
  },
  {
    id: 'collection-carousel-1',
    __component: 'sections.collection-carousel',
    title: 'Curated Festive Edit',
    subtitle: 'Most loved ethnic styles and designer silhouettes',
    collectionHandle: 'festive-edit',
    viewAllLink: '/category/women',
    desktopVisibleItems: 5,
    mobileVisibleItems: 2,
    sliderEnabled: true,
    limit: 12,
  },
  {
    id: 'sale-banner-1',
    __component: 'sections.sale-banner',
    title: 'Mega Season Finale Sale',
    discountHighlight: 'UP TO 60% OFF + EXTRA 10% ON PREPAID',
    ctaText: 'Explore Flash Sale',
    ctaLink: '/sale',
  },
  {
    id: 'product-grid-1',
    __component: 'sections.product-grid',
    title: 'Trending New Arrivals',
    subtitle: 'Fresh drops added weekly to elevate your wardrobe',
    limit: 12,
    desktopVisibleItems: 4,
    mobileVisibleItems: 2,
    sliderEnabled: true,
    viewAllLink: '/category/women',
  },
  {
    id: 'promotional-cta-1',
    __component: 'sections.promotional-cta',
    title: 'The Linen & Silk Capsule',
    description: 'Experience breathable luxury with our limited-edition pure mulberry silks and handwoven organic linens.',
    badgeText: 'LIMITED EDITION',
    ctaText: 'Discover the Capsule',
    ctaLink: '/collections/capsule',
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchCmsPage('homepage');

  if (page?.seo) {
    return {
      title: page.seo.metaTitle || 'EcomFashion | Premium Indian Ethnic & Western Wear',
      description:
        page.seo.metaDescription ||
        'Discover high quality fashion, ethnic kurtas, sarees, and modern western silhouettes with fast delivery across India.',
      alternates: {
        canonical: page.seo.canonicalUrl || 'https://ecomfashion.com',
      },
      robots: page.seo.preventIndexing ? { index: false, follow: false } : undefined,
    };
  }

  return {
    title: 'EcomFashion | Premium Indian Ethnic & Western Wear',
    description:
      'Discover high quality fashion, ethnic kurtas, sarees, and modern western silhouettes with fast delivery across India.',
  };
}

export default async function HomePage() {
  const page: CmsPageDto | null = await fetchCmsPage('homepage');
  const sections = page?.sections && page.sections.length > 0 ? page.sections : DEFAULT_HOMEPAGE_SECTIONS;

  // Fetch initial batch of products from Medusa for the bottom infinite feed
  const feedResult = await fetchPlpProducts({
    limit: 24,
    offset: 0,
    sort: 'relevance',
  });

  return (
    <main className="min-h-screen bg-white">
      {/* CMS-driven editorial homepage sections */}
      <SectionRenderer sections={sections} />

      {/* Dedicated bottom homepage multi-row infinite product feed */}
      <HomepageProductFeed
        initialProducts={feedResult.products}
        initialTotalCount={feedResult.totalCount}
        initialHasMore={feedResult.hasMore}
        initialNextOffset={feedResult.nextOffset}
      />
    </main>
  );
}
