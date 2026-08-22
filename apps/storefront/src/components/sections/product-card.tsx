import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Heart } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Text } from '../ui/typography';
import { formatINR } from '../../lib/utils';
import type { StorefrontProduct } from '../../lib/commerce';

export interface ProductCardProps {
  product: StorefrontProduct;
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <Card className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:shadow-md hover:border-brand-200">
      {/* Product Image / Placeholder */}
      <Link
        href={`/product/${product.handle}`}
        className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100 block"
      >
        {product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-300">
            <ShoppingBag className="h-12 w-12 opacity-30 group-hover:scale-110 transition-transform" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1 z-10">
          {product.discountPercentage ? (
            <Badge variant="brand" size="sm">
              -{product.discountPercentage}%
            </Badge>
          ) : product.isNew ? (
            <Badge variant="success" size="sm">
              NEW
            </Badge>
          ) : null}
        </div>

        {/* Wishlist Button Placeholder */}
        <button
          type="button"
          aria-label={`Save ${product.title} to wishlist`}
          className="absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow-xs backdrop-blur-xs transition-colors hover:bg-brand-50 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <Heart className="h-4 w-4" />
        </button>
      </Link>

      {/* Product Details */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        {product.categoryName && (
          <Text variant="caption" weight="medium" className="text-gray-400 uppercase tracking-wider line-clamp-1">
            {product.categoryName}
          </Text>
        )}
        <Link href={`/product/${product.handle}`} className="group-hover:text-brand-600 transition-colors">
          <Text weight="semibold" className="text-sm text-gray-900 line-clamp-1 mt-0.5">
            {product.title}
          </Text>
        </Link>

        {/* Pricing */}
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-sm font-bold text-gray-900 sm:text-base">
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
