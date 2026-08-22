import React from 'react';
import type { Metadata } from 'next';
import { fetchCommerceProducts } from '../../../lib/commerce';
import { constructMetadata } from '../../../lib/seo';
import { PlpView } from '../../../components/plp';

export const revalidate = 60; // ISR revalidation every 60 seconds

export async function generateMetadata(): Promise<Metadata> {
  return constructMetadata({
    title: 'Mega Flash Sale & Clearance Deals | Up to 70% Off',
    description:
      'Shop our biggest sale of the season. Flat discounts on ethnic sarees, kurtis, western dresses, linen shirts, and plus size fashion. Extra savings on prepaid orders.',
    canonicalUrl: '/sale/all',
  });
}

export default async function SaleAllPlpPage() {
  const products = await fetchCommerceProducts({
    onSaleOnly: true,
    limit: 24,
  });

  return (
    <main className="min-h-screen bg-white">
      <PlpView
        title="Mega Flash Sale & Clearance Deals"
        subtitle="Limited-time markdowns and clearance steals across handpicked ethnic wear, westerns, and festive styles."
        badge="UP TO 70% OFF"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Sale', href: '/sale' },
          { label: 'All Sale Deals' },
        ]}
        products={products}
        emptyTitle="No Flash Deals Right Now"
        emptyDescription="All current flash deals have ended. Check back tomorrow for new daily clearance markdowns."
      />
    </main>
  );
}
