import React from 'react';
import type { CmsProductCarouselSection } from '@ecom/types';
import { Container } from '../ui/container';
import { Heading, Text } from '../ui/typography';
import { ProductCard } from './product-card';
import { fetchCommerceProducts } from '../../lib/commerce';
import type { StorefrontProduct } from '../../lib/commerce';
import { Flame } from 'lucide-react';

export interface ProductCarouselSectionProps {
  section: CmsProductCarouselSection;
}

export const ProductCarouselSection = async ({ section }: ProductCarouselSectionProps) => {
  let products: StorefrontProduct[] = [];

  try {
    products = await fetchCommerceProducts({
      collectionHandle: section.collectionHandle,
      categoryHandle: section.categoryHandle,
      limit: section.limit || 8,
    });
  } catch (err) {
    console.error('Failed to fetch carousel products:', err);
    products = [];
  }

  if (!products || products.length === 0) {
    products = [
      { id: '1', title: 'Handblock Printed Kurti Set', handle: 'handblock-kurti', price: 1499, originalPrice: 2299, discountPercentage: 35, categoryName: 'Kurtis', isHot: true },
      { id: '2', title: 'Solid Mandarin Collar Cotton Shirt', handle: 'mandarin-shirt', price: 1199, originalPrice: 1799, discountPercentage: 33, categoryName: 'Shirts' },
      { id: '3', title: 'Tiered Georgette Party Dress', handle: 'georgette-dress', price: 1799, originalPrice: 2799, discountPercentage: 36, categoryName: 'Dresses', isNew: true },
      { id: '4', title: 'Straight Fit Stretch Denims', handle: 'stretch-denim', price: 1599, originalPrice: 2499, discountPercentage: 36, categoryName: 'Denim' },
    ];
  }

  return (
    <section className="w-full py-8 sm:py-12 bg-white">
      <Container size="xl">
        <div className="mb-6">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-600 mb-1">
            <Flame className="h-3.5 w-3.5" />
            <span>TRENDING NOW</span>
          </div>
          <Heading level={2} size="lg" className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            {section.title}
          </Heading>
          {section.subtitle && (
            <Text className="text-xs sm:text-sm text-gray-500 mt-0.5">{section.subtitle}</Text>
          )}
        </div>

        <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0 scroll-smooth">
          {products.map((product) => (
            <div key={product.id} className="w-[180px] sm:w-[220px] md:w-[250px] shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};
ProductCarouselSection.displayName = 'ProductCarouselSection';
