import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchCommerceProducts } from '../../../lib/commerce';
import { constructMetadata } from '../../../lib/seo';
import { PlpView } from '../../../components/plp';

export const revalidate = 60; // ISR revalidation every 60 seconds

interface BrandPlpProps {
  params: {
    handle: string;
  };
}

const KNOWN_BRANDS: Record<string, string> = {
  'virasat-heritage': 'Virasat Heritage',
  'gulmohar-jaipur': 'Gulmohar Jaipur',
  'meadow-studio': 'Meadow Studio',
  'loom-thread': 'Loom & Thread',
};

function formatBrandName(handle: string): string {
  if (KNOWN_BRANDS[handle]) {
    return KNOWN_BRANDS[handle];
  }
  return handle
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export async function generateMetadata({ params }: BrandPlpProps): Promise<Metadata> {
  const brandName = formatBrandName(params.handle);
  const products = await fetchCommerceProducts({ brand: params.handle, limit: 1 });

  if (products.length === 0 && !KNOWN_BRANDS[params.handle]) {
    return {
      title: 'Brand Not Found | EcomFashion',
      robots: { index: false, follow: false },
    };
  }

  return constructMetadata({
    title: `${brandName} Official Store | Designer Styles`,
    description: `Shop authentic apparel and fashion collections from ${brandName}. Verified genuine products, fast delivery across India, and cash on delivery.`,
    canonicalUrl: `/brand/${params.handle}`,
  });
}

export default async function BrandPlpPage({ params }: BrandPlpProps) {
  const brandName = formatBrandName(params.handle);
  const products = await fetchCommerceProducts({
    brand: params.handle,
    limit: 24,
  });

  if (products.length === 0 && !KNOWN_BRANDS[params.handle]) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white">
      <PlpView
        title={`${brandName} Official Store`}
        subtitle={`Discover handcrafted collections and exclusive drops from ${brandName}. 100% authentic quality guaranteed.`}
        badge="BRAND SPOTLIGHT"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Brands', href: '/' },
          { label: brandName },
        ]}
        products={products}
        emptyTitle={`No products currently available for ${brandName}`}
        emptyDescription={`We are restocking new season inventory from ${brandName}. Please check back shortly.`}
      />
    </main>
  );
}
