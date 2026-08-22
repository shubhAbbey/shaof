import React from 'react';
import Link from 'next/link';
import type { CmsCollectionCarouselSection } from '@ecom/types';
import { Container } from '../ui/container';
import { Heading, Text } from '../ui/typography';
import { HorizontalItemScroller } from '../ui/horizontal-item-scroller';
import { ProductCard } from './product-card';
import { fetchCommerceProducts } from '../../lib/commerce';
import type { StorefrontProduct } from '../../lib/commerce';
import { ArrowRight, Sparkles } from 'lucide-react';

export interface CollectionCarouselSectionProps {
  section: CmsCollectionCarouselSection;
}

function getItemWidthClass(desktopCount: number = 5): string {
  if (desktopCount === 4) {
    return 'w-[calc(50%-6px)] sm:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)] shrink-0 snap-start';
  }
  if (desktopCount === 3) {
    return 'w-[calc(50%-6px)] sm:w-[calc(33.333%-11px)] shrink-0 snap-start';
  }
  if (desktopCount === 6) {
    return 'w-[calc(50%-6px)] sm:w-[calc(33.333%-11px)] md:w-[calc(25%-12px)] lg:w-[calc(16.666%-14px)] shrink-0 snap-start';
  }
  // Default: 5 visible items on desktop, 2 on mobile
  return 'w-[calc(50%-6px)] sm:w-[calc(33.333%-11px)] md:w-[calc(25%-12px)] lg:w-[calc(20%-13px)] shrink-0 snap-start';
}

export const CollectionCarouselSection = async ({ section }: CollectionCarouselSectionProps) => {
  const desktopVisibleItems = section.desktopVisibleItems || 5;
  const mobileVisibleItems = section.mobileVisibleItems || 2;
  const sliderEnabled = section.sliderEnabled !== false;

  let products: StorefrontProduct[] = [];

  try {
    products = await fetchCommerceProducts({
      collectionHandle: section.collectionHandle,
      limit: section.limit || 12,
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
      { id: '5', title: 'Handloom Cotton Kurta Palazzo', handle: 'cotton-kurta-palazzo', price: 1699, originalPrice: 2599, discountPercentage: 35, categoryName: 'Ethnic Sets' },
    ];
  }

  const itemWidthClass = getItemWidthClass(desktopVisibleItems);

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
            className="flex items-center gap-1 text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors shrink-0"
          >
            <span>View All</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* CMS-controlled 1-row horizontal carousel with slider controls */}
        <HorizontalItemScroller
          desktopVisibleItems={desktopVisibleItems}
          mobileVisibleItems={mobileVisibleItems}
          sliderEnabled={sliderEnabled}
        >
          {products.map((product) => (
            <div key={product.id} className={itemWidthClass}>
              <ProductCard product={product} />
            </div>
          ))}
        </HorizontalItemScroller>
      </Container>
    </section>
  );
};
CollectionCarouselSection.displayName = 'CollectionCarouselSection';
