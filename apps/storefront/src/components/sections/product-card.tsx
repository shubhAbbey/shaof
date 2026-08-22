import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Heart, ArrowRight } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Text } from '../ui/typography';
import { formatINR } from '../../lib/utils';
import type { StorefrontProduct } from '../../lib/commerce';

export interface ProductCardProps {
  product: StorefrontProduct;
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, priority = false }) => {
  const isOutOfStock = product.inStock === false;

  return (
    <Card className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:shadow-md hover:border-brand-200">
      {/* Product Image / Visual Anchor */}
      <Link
        href={`/product/${product.handle}`}
        className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100 block"
      >
        {product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt={product.title}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-300">
            <ShoppingBag className="h-12 w-12 opacity-30 group-hover:scale-110 transition-transform" />
          </div>
        )}

        {/* Badges Overlay */}
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1 z-10">
          {isOutOfStock ? (
            <Badge variant="outline" size="sm" className="bg-white/90 text-gray-700 font-bold">
              OUT OF STOCK
            </Badge>
          ) : product.discountPercentage && product.discountPercentage > 0 ? (
            <Badge variant="brand" size="sm" className="font-bold">
              -{product.discountPercentage}% OFF
            </Badge>
          ) : product.isHot ? (
            <Badge variant="danger" size="sm" className="font-bold">
              HOT
            </Badge>
          ) : product.isNew ? (
            <Badge variant="success" size="sm" className="font-bold">
              NEW
            </Badge>
          ) : null}
        </div>

        {/* Wishlist Action Button */}
        <button
          type="button"
          aria-label={`Save ${product.title} to wishlist`}
          className="absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow-xs backdrop-blur-xs transition-colors hover:bg-brand-50 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <Heart className="h-4 w-4" />
        </button>

        {/* Quick Action Overlay (Variant Safe) */}
        <div className="absolute inset-x-2 bottom-2 z-10 hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-white/95 backdrop-blur-xs text-xs font-semibold text-gray-900 shadow-sm border border-gray-100 hover:bg-brand-600 hover:text-white transition-colors">
            {product.hasMultipleVariants ? 'Select Options' : 'View Product'}
            <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </Link>

      {/* Product Details */}
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {/* Brand / Category Hierarchy */}
        <div className="flex items-center justify-between text-[11px] font-medium text-gray-400 uppercase tracking-wider line-clamp-1 mb-0.5">
          <span>{product.brand || product.categoryName || 'Fashion'}</span>
          {product.categoryName && product.brand && (
            <span className="text-[10px] text-gray-300 lowercase font-normal">in {product.categoryName}</span>
          )}
        </div>

        {/* Product Title */}
        <Link
          href={`/product/${product.handle}`}
          className="group-hover:text-brand-600 transition-colors focus-visible:outline-none focus-visible:underline"
        >
          <Text weight="semibold" className="text-xs sm:text-sm text-gray-900 line-clamp-2 leading-tight">
            {product.title}
          </Text>
        </Link>

        {/* Pricing & Discount */}
        <div className="mt-auto pt-2 flex items-baseline gap-2">
          <span className="text-sm sm:text-base font-bold text-gray-950">
            {formatINR(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs text-gray-400 line-through">
              {formatINR(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};
ProductCard.displayName = 'ProductCard';
