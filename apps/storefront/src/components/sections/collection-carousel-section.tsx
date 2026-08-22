import React from 'react';
import Link from 'next/link';
import type { CmsCollectionCarouselSection } from '@ecom/types';
import { Container } from '../ui/container';
import { Heading, Text } from '../ui/typography';
import { ProductCard } from './product-card';
import { fetchCommerceProducts } from '../../lib/commerce';
import type { StorefrontProduct } from '../../lib/commerce';
import { ArrowRight, Sparkles } from 'lucide-react';

export interface CollectionCarouselSectionProps {
  section: CmsCollectionCarouselSection;
}

export const CollectionCarouselSection = async ({ section }: CollectionCarouselSectionProps) => {
  let products: StorefrontProduct[] = [];

  try {
    products = await fetchCommerceProducts({
      collectionHandle: section.collectionHandle,
      limit: section.limit || 8,
    });
  } catch (err) {
    console.error('Failed to fetch collection products:', err);
    products = [];
  }

  // Fallback fixtures if commerce backend is unseeded
  if (!products || products.length === 0) {
    products = [
      { id: '1', title: 'Embroidered Mulmul Anarkali Set', handle: 'anarkali-set', price: 1899, originalPrice: 2999, discountPercentage: 36, categoryName: 'Ethnic Wear', isHot: true },
      { id: '2', title: 'Floral Chanderi Silk Saree', handle: 'chanderi-saree', price: 2499, originalPrice: 3999, discountPercentage: 37, categoryName: 'Sarees', isNew: true },
      { id: '3', title: 'Printed Cotton Tiered Maxi Dress', handle: 'cotton-maxi-dress', price: 1299, originalPrice: 1999, discountPercentage: 35, categoryName: 'Western Dresses' },
      { id: '4', title: 'Relaxed Fit Linen Casual Shirt', handle: 'linen-shirt', price: 1499, originalPrice: 2199, discountPercentage: 31, categoryName: 'Men Topwear' },
    ];
  }

  return (
    <section className="w-full py-8 sm:py-12">
      <Container size="xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600 mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>CURATED COLLECTION</span>
            </div>
            <Heading level={2} size="lg" className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              {section.title}
            </Heading>
            {section.subtitle && (
              <Text className="text-xs sm:text-sm text-gray-500 mt-0.5">{section.subtitle}</Text>
            )}
          </div>

          <Link
            href={section.viewAllLink || `/collections/${section.collectionHandle}`}
            className="flex items-center gap-1 text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Horizontally scrollable product carousel */}
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
CollectionCarouselSection.displayName = 'CollectionCarouselSection';
