import React from 'react';
import Link from 'next/link';
import type { CmsProductGridSection } from '@ecom/types';
import { Container } from '../ui/container';
import { Heading, Text } from '../ui/typography';
import { HorizontalItemScroller } from '../ui/horizontal-item-scroller';
import { ProductCard } from './product-card';
import { fetchCommerceProducts } from '../../lib/commerce';
import type { StorefrontProduct } from '../../lib/commerce';
import { Sparkles, ArrowRight } from 'lucide-react';

export interface ProductGridSectionProps {
  section: CmsProductGridSection;
}

function getItemWidthClass(desktopCount: number = 4): string {
  if (desktopCount === 4) {
    return 'w-[calc(50%-6px)] sm:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)] shrink-0 snap-start';
  }
  if (desktopCount === 3) {
    return 'w-[calc(50%-6px)] sm:w-[calc(33.333%-11px)] shrink-0 snap-start';
  }
  if (desktopCount === 6) {
    return 'w-[calc(50%-6px)] sm:w-[calc(33.333%-11px)] md:w-[calc(25%-12px)] lg:w-[calc(16.666%-14px)] shrink-0 snap-start';
  }
  if (desktopCount === 5) {
    return 'w-[calc(50%-6px)] sm:w-[calc(33.333%-11px)] md:w-[calc(25%-12px)] lg:w-[calc(20%-13px)] shrink-0 snap-start';
  }
  return 'w-[calc(50%-6px)] sm:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)] shrink-0 snap-start';
}

export const ProductGridSection = async ({ section }: ProductGridSectionProps) => {
  const desktopVisibleItems = section.desktopVisibleItems || section.columns || 4;
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
    console.error('Failed to fetch grid products:', err);
    products = [];
  }

  if (!products || products.length === 0) {
    products = [
      { id: '1', title: 'Zari Border Banarasi Art Silk Saree', handle: 'banarasi-saree', price: 2199, originalPrice: 3499, discountPercentage: 37, categoryName: 'Sarees', isHot: true },
      { id: '2', title: 'Flared Cotton Kurti with Palazzo', handle: 'cotton-kurti-palazzo', price: 1699, originalPrice: 2599, discountPercentage: 35, categoryName: 'Kurtis' },
      { id: '3', title: 'Slim Fit Pure Linen Casual Shirt', handle: 'linen-casual-shirt', price: 1399, originalPrice: 1999, discountPercentage: 30, categoryName: 'Shirts' },
      { id: '4', title: 'Wrap Style Floral Summer Dress', handle: 'wrap-floral-dress', price: 1599, originalPrice: 2399, discountPercentage: 33, categoryName: 'Dresses', isNew: true },
      { id: '5', title: 'Handblock Printed Kurti Set', handle: 'handblock-kurti', price: 1499, originalPrice: 2299, discountPercentage: 35, categoryName: 'Kurtis', isHot: true },
      { id: '6', title: 'Solid Mandarin Collar Cotton Shirt', handle: 'mandarin-shirt', price: 1199, originalPrice: 1799, discountPercentage: 33, categoryName: 'Shirts' },
    ];
  }

  const viewAllHref =
    section.viewAllLink ||
    (section.categoryHandle
      ? `/category/${section.categoryHandle}`
      : section.collectionHandle
      ? `/collections/${section.collectionHandle}`
      : '/category/women');

  const itemWidthClass = getItemWidthClass(desktopVisibleItems);

  return (
    <section className="w-full py-8 sm:py-12 bg-gray-50/40">
      <Container size="xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600 mb-1">
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

          <Link
            href={viewAllHref}
            className="flex items-center gap-1 text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors shrink-0"
          >
            <span>View All</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
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
ProductGridSection.displayName = 'ProductGridSection';
