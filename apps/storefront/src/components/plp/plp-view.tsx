import React from 'react';
import Link from 'next/link';
import { ChevronRight, Sparkles, PackageOpen } from 'lucide-react';
import { Container } from '../ui/container';
import { Heading, Text } from '../ui/typography';
import { EmptyState } from '../ui/empty-state';
import { ErrorState } from '../ui/error-state';
import { ProductCard } from '../sections/product-card';
import type { StorefrontProduct } from '../../lib/commerce';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PlpViewProps {
  title: string;
  subtitle?: string;
  badge?: string;
  breadcrumbs?: BreadcrumbItem[];
  products: StorefrontProduct[];
  totalCount?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  error?: string;
}

export const PlpView: React.FC<PlpViewProps> = ({
  title,
  subtitle,
  badge,
  breadcrumbs = [{ label: 'Home', href: '/' }],
  products,
  totalCount,
  emptyTitle = 'No Products Found',
  emptyDescription = 'We currently do not have items available in this section. Please explore our other trending collections.',
  error,
}) => {
  const displayCount = totalCount !== undefined ? totalCount : products.length;

  return (
    <div className="w-full bg-white pb-16 pt-4 sm:pt-6">
      <Container size="xl">
        {/* 1. Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-4 sm:mb-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <li key={index} className="inline-flex items-center gap-1.5">
                  {item.href && !isLast ? (
                    <Link
                      href={item.href}
                      className="hover:text-brand-600 transition-colors font-medium"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      className={isLast ? 'font-semibold text-gray-900 line-clamp-1' : ''}
                      aria-current={isLast ? 'page' : undefined}
                    >
                      {item.label}
                    </span>
                  )}
                  {!isLast && (
                    <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" aria-hidden="true" />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {/* 2. PLP Header Banner / Information */}
        <div className="mb-6 border-b border-gray-100 pb-5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              {badge && (
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full mb-2">
                  <Sparkles className="h-3 w-3" />
                  <span>{badge}</span>
                </div>
              )}
              <Heading level={1} className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
                {title}
              </Heading>
              {subtitle && (
                <Text className="mt-1 text-sm text-gray-500 max-w-2xl">
                  {subtitle}
                </Text>
              )}
            </div>

            {/* Product Counter / Summary */}
            <div className="text-xs sm:text-sm font-medium text-gray-500 shrink-0">
              Showing <span className="font-bold text-gray-900">{displayCount}</span> {displayCount === 1 ? 'item' : 'items'}
            </div>
          </div>
        </div>

        {/* 3. Main Content: Error / Empty / Product Grid */}
        {error ? (
          <ErrorState
            title="Failed to Load Products"
            message={error}
          />
        ) : products.length === 0 ? (
          <EmptyState
            icon={<PackageOpen className="h-8 w-8 text-gray-400" />}
            title={emptyTitle}
            description={emptyDescription}
            actionText="Explore All Categories"
            actionHref="/category/women"
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {products.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={idx < 4}
              />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
};
PlpView.displayName = 'PlpView';
