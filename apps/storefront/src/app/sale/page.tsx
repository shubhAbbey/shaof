import React from 'react';
import type { Metadata } from 'next';
import { fetchCmsPage } from '../../lib/strapi-client';
import { constructCmsSeoMetadata } from '../../lib/seo';
import { SectionRenderer } from '../../components/sections';
import type { CmsPageDto, CmsSection } from '@ecom/types';

export const revalidate = 60; // ISR revalidation every 60 seconds

const DEFAULT_SALE_SECTIONS: CmsSection[] = [
  {
    id: 'sale-hero-1',
    __component: 'sections.sale-banner',
    title: 'Mega Season Finale Flash Sale',
    discountHighlight: 'FLAT 50% - 70% OFF ON ALL CATEGORIES',
    ctaText: 'Shop All Deals',
    ctaLink: '/sale/all',
  },
  {
    id: 'sale-collection-1',
    __component: 'sections.collection-carousel',
    title: 'Top Steals in Ethnic Wear',
    subtitle: 'Handcrafted Anarkalis, Sarees, and Kurtis at Unbeatable Prices',
    collectionHandle: 'sale-ethnic',
    viewAllLink: '/collections/sale-ethnic',
    limit: 8,
  },
  {
    id: 'sale-grid-1',
    __component: 'sections.product-grid',
    title: 'Clearance Spotlight',
    subtitle: 'Limited stock remaining across trending sizes and styles',
    limit: 8,
    columns: 4,
  },
  {
    id: 'sale-banner-bottom',
    __component: 'sections.banner',
    title: 'Extra 10% Off on Prepaid UPI & Cards',
    subtitle: 'Instant discount applied at checkout on all orders above ₹1499.',
    badgeText: 'PREPAID BENEFIT',
    ctaLink: '/sale/all',
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const page: CmsPageDto | null = await fetchCmsPage('sale');

  return constructCmsSeoMetadata(
    page?.seo,
    page?.title || 'Mega Season Finale Sale | Up to 70% Off | EcomFashion'
  );
}

export default async function SalePage() {
  const page: CmsPageDto | null = await fetchCmsPage('sale');
  const sections =
    page?.sections && page.sections.length > 0 ? page.sections : DEFAULT_SALE_SECTIONS;

  return (
    <main className="min-h-screen bg-white">
      <SectionRenderer sections={sections} />
    </main>
  );
}
