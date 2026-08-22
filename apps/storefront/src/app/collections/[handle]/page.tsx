import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchCollectionByHandle, fetchCommerceProducts } from '../../../lib/commerce';
import { constructMetadata } from '../../../lib/seo';
import { PlpView } from '../../../components/plp';

export const revalidate = 60; // ISR revalidation every 60 seconds

interface CollectionPlpProps {
  params: {
    handle: string;
  };
}

export async function generateMetadata({ params }: CollectionPlpProps): Promise<Metadata> {
  const collection = await fetchCollectionByHandle(params.handle);

  if (!collection) {
    return {
      title: 'Collection Not Found | EcomFashion',
      robots: { index: false, follow: false },
    };
  }

  return constructMetadata({
    title: `${collection.title} | Curated Collection`,
    description:
      collection.description ||
      `Explore our handpicked ${collection.title} styles with pure fabrics, limited edition designs, and fast delivery across India.`,
    canonicalUrl: `/collections/${params.handle}`,
  });
}

export default async function CollectionPlpPage({ params }: CollectionPlpProps) {
  const collection = await fetchCollectionByHandle(params.handle);

  if (!collection) {
    notFound();
  }

  const products = await fetchCommerceProducts({
    collectionId: collection.id,
    limit: 24,
  });

  return (
    <main className="min-h-screen bg-white">
      <PlpView
        title={collection.title}
        subtitle={
          collection.description ||
          `Exclusive collection featuring limited-run silhouettes and premium quality artisanal craftsmanship.`
        }
        badge="CURATED COLLECTION"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Collections', href: '/' },
          { label: collection.title },
        ]}
        products={products}
        emptyTitle={`No products currently in ${collection.title}`}
        emptyDescription="All products in this curated capsule have currently been claimed. Check back soon for our next drop."
      />
    </main>
  );
}
