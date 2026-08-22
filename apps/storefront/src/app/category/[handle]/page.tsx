import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchCategoryByHandle, fetchCommerceProducts } from '../../../lib/commerce';
import { constructMetadata } from '../../../lib/seo';
import { PlpView } from '../../../components/plp';
import { NAVIGATION_CATEGORIES } from '../../../data/navigation';

export const revalidate = 60; // ISR revalidation every 60 seconds

interface CategoryPlpProps {
  params: {
    handle: string;
  };
}

export async function generateMetadata({ params }: CategoryPlpProps): Promise<Metadata> {
  const category = await fetchCategoryByHandle(params.handle);

  if (!category) {
    // Check navigation fallback
    const navCategory = NAVIGATION_CATEGORIES.find((c) => c.handle === params.handle);
    if (navCategory) {
      return constructMetadata({
        title: `${navCategory.name} Online Collection`,
        description: `Explore the trending ${navCategory.name} collection with authentic styles, premium fabrics, and express delivery across India.`,
      });
    }
    return {
      title: 'Category Not Found | EcomFashion',
      robots: { index: false, follow: false },
    };
  }

  return constructMetadata({
    title: `${category.name} Collection`,
    description:
      category.description ||
      `Shop high quality ${category.name} online at unbeatable prices. Fast shipping and COD available across India.`,
    canonicalUrl: `/category/${params.handle}`,
  });
}

export default async function CategoryPlpPage({ params }: CategoryPlpProps) {
  let category = await fetchCategoryByHandle(params.handle);

  if (!category) {
    // Check if valid known navigation category
    const navCat = NAVIGATION_CATEGORIES.find((c) => c.handle === params.handle);
    if (!navCat) {
      notFound();
    }
    // Context with zero products
    return (
      <main className="min-h-screen bg-white">
        <PlpView
          title={navCat.name}
          subtitle="Explore trending styles in this category."
          badge={navCat.badge}
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Categories', href: '/' },
            { label: navCat.name },
          ]}
          products={[]}
          emptyTitle={`No products found in ${navCat.name}`}
          emptyDescription={`We are adding new products to our ${navCat.name} catalog soon. Please check back shortly.`}
        />
      </main>
    );
  }

  const products = await fetchCommerceProducts({
    categoryId: category.id,
    limit: 24,
  });

  return (
    <main className="min-h-screen bg-white">
      <PlpView
        title={category.name}
        subtitle={
          category.description ||
          `Handpicked styles and curated trends in ${category.name} with premium quality fabrics and designs.`
        }
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Categories', href: '/' },
          { label: category.name },
        ]}
        products={products}
        emptyTitle={`No products currently in ${category.name}`}
        emptyDescription="We are currently restocking this category. Explore our new arrivals in the meantime."
      />
    </main>
  );
}
