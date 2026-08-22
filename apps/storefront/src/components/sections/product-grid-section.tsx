import React from 'react';
import type { CmsProductGridSection } from '@ecom/types';
import { Container } from '../ui/container';
import { Heading, Text } from '../ui/typography';
import { ProductCard } from './product-card';
import { fetchCommerceProducts } from '../../lib/commerce';
import type { StorefrontProduct } from '../../lib/commerce';
import { cn } from '../../lib/utils';
import { Sparkles } from 'lucide-react';

export interface ProductGridSectionProps {
  section: CmsProductGridSection;
}

export const ProductGridSection = async ({ section }: ProductGridSectionProps) => {
  let products: StorefrontProduct[] = [];

  try {
    products = await fetchCommerceProducts({
      collectionHandle: section.collectionHandle,
      categoryHandle: section.categoryHandle,
      limit: section.limit || 8,
    });
  } catch (err) {
    console.error('Failed to fetch grid products:', err);
    products = [];
  }

  if (!products || products.length === 0) {
    products = [
      { id: '1', title: 'Zari Border Banarasi Art Silk Saree', handle: 'banarasi-saree', price: 2199, originalPrice: 3499, discountPercentage: 37, categoryName: 'Sarees', isHot: true },
      { id: '2', title: 'Flared Cotton Kurti with Palazzo', handle: 'cotton-kurti-palazzo', price: 1699, originalPrice: 2599, discountPercentage: 35, categoryName: 'Kurtis' },
      { id: '3', title: 'Slim Fit Pure Linen Casual Shirt', handle: 'linen-casual-shirt', price: 1399, originalPrice: 1999, discountPercentage: 30, categoryName: 'Shirts' },
      { id: '4', title: 'Wrap Style Floral Summer Dress', handle: 'wrap-floral-dress', price: 1599, originalPrice: 2399, discountPercentage: 33, categoryName: 'Dresses', isNew: true },
    ];
  }

  const gridColsClass =
    section.columns === 3
      ? 'grid-cols-2 sm:grid-cols-3'
      : section.columns === 2
      ? 'grid-cols-2'
      : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4';

  return (
    <section className="w-full py-8 sm:py-12 bg-gray-50/40">
      <Container size="xl">
        <div className="mb-6 sm:mb-8 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600 mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>NEW ARRIVALS</span>
          </div>
          <Heading level={2} size="lg" className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            {section.title}
          </Heading>
          {section.subtitle && (
            <Text className="text-xs sm:text-sm text-gray-500 mt-0.5">{section.subtitle}</Text>
          )}
        </div>

        <div className={cn('grid gap-3 sm:gap-4 md:gap-6', gridColsClass)}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </section>
  );
};
ProductGridSection.displayName = 'ProductGridSection';
