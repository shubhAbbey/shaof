import React from 'react';
import type { Metadata } from 'next';
import { fetchCmsPage } from '../lib/strapi-client';
import { SectionRenderer } from '../components/sections';
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
  },
  {
    id: 'collection-carousel-1',
    __component: 'sections.collection-carousel',
    title: 'Curated Festive Edit',
    subtitle: 'Most loved ethnic styles and designer silhouettes',
    collectionHandle: 'festive-edit',
    viewAllLink: '/category/women',
    limit: 8,
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
    limit: 8,
    columns: 4,
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

  return (
    <main className="min-h-screen bg-white">
      <SectionRenderer sections={sections} />
    </main>
  );
}
