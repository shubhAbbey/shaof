import React from 'react';
import Link from 'next/link';
import type { CmsProductCarouselSection } from '@ecom/types';
import { Container } from '../ui/container';
import { Heading, Text } from '../ui/typography';
import { HorizontalItemScroller } from '../ui/horizontal-item-scroller';
import { ProductCard } from './product-card';
import { fetchCommerceProducts } from '../../lib/commerce';
import type { StorefrontProduct } from '../../lib/commerce';
import { Flame, ArrowRight } from 'lucide-react';

export interface ProductCarouselSectionProps {
  section: CmsProductCarouselSection;
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

export const ProductCarouselSection = async ({ section }: ProductCarouselSectionProps) => {
  const desktopVisibleItems = section.desktopVisibleItems || 5;
  const mobileVisibleItems = section.mobileVisibleItems || 2;
  const sliderEnabled = section.sliderEnabled !== false;

  let products: StorefrontProduct[] = [];

  try {
    products = await fetchCommerceProducts({
      collectionHandle: section.collectionHandle,
      categoryHandle: section.categoryHandle,
      limit: section.limit || 12,
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
      { id: '5', title: 'Embroidered Silk Blend Kurta', handle: 'silk-kurta', price: 2199, originalPrice: 3499, discountPercentage: 37, categoryName: 'Kurtas' },
    ];
  }

  const itemWidthClass = getItemWidthClass(desktopVisibleItems);

  return (
    <section className="w-full py-8 sm:py-12 bg-white">
      <Container size="xl">
        <div className="flex items-center justify-between mb-6">
          <div>
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

          {section.viewAllLink && (
            <Link
              href={section.viewAllLink}
              className="flex items-center gap-1 text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors shrink-0"
            >
              <span>View All</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {/* CMS-controlled 1-row horizontal carousel */}
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
ProductCarouselSection.displayName = 'ProductCarouselSection';
