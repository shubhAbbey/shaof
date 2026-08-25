'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Trash2, ArrowRight, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { useWishlist } from '../../context/wishlist-context';
import { useCart } from '../../context/cart-context';
import { useAuth } from '../../context/auth-context';
import { useToast } from '../../components/ui/toast';
import { Container } from '../../components/ui/container';
import { Heading, Text } from '../../components/ui/typography';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';
import { formatINR, cn } from '../../lib/utils';
import type { WishlistItemDto } from '@ecom/types';

export default function WishlistPage() {
  const { items, itemCount, isLoading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated, openLogin } = useAuth();
  const { toast } = useToast();

  const [movingItemId, setMovingItemId] = useState<string | null>(null);

  const handleMoveToBag = async (item: WishlistItemDto) => {
    if (item.inStock === false) {
      toast.warning('This item is currently out of stock.', 'Out of Stock');
      return;
    }

    if (!item.variantId || item.variantId.startsWith('prod_')) {
      toast.error('Please view the product page to choose your preferred variant before adding to bag.', 'Variant Selection Required');
      return;
    }

    setMovingItemId(item.id);
    try {
      const targetVariantId = item.variantId;
      const success = await addToCart(targetVariantId, 1);
      if (success) {
        toast.success(`${item.title} moved to your bag.`, 'Added to Bag');
        await removeFromWishlist(item.id);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to move item to bag', 'Error');
    } finally {
      setMovingItemId(null);
    }
  };

  // 1. Unauthenticated Guest State (fallback if middleware somehow bypassed)
  if (!isAuthenticated && !isLoading) {
    return (
      <div className="min-h-[70vh] bg-gray-50/50 py-12 sm:py-16">
        <Container size="md">
          <Card className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-white shadow-xs border-gray-100">
            <div className="h-16 w-16 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
              <Heart className="h-8 w-8" />
            </div>
            <Heading level={2} className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Sign In to View Your Wishlist
            </Heading>
            <Text className="text-gray-500 max-w-md mb-6 text-sm sm:text-base">
              Save your favorite sarees, kurtis, and modern ethnic wear across devices. Sign in to view and manage your saved items.
            </Text>
            <Button
              variant="primary"
              size="lg"
              onClick={() => openLogin('/wishlist')}
              className="rounded-xl px-8"
            >
              Sign In to Continue
            </Button>

          </Card>
        </Container>
      </div>
    );
  }

  // 2. Loading State
  if (isLoading) {
    return (
      <div className="min-h-[70vh] bg-gray-50/50 py-8 sm:py-12">
        <Container>
          <div className="mb-6 animate-pulse">
            <div className="h-8 w-48 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-32 bg-gray-100 rounded"></div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map((idx) => (
              <div key={idx} className="h-80 rounded-xl bg-gray-100 animate-pulse"></div>
            ))}
          </div>
        </Container>
      </div>
    );
  }

  // 3. Authenticated Empty State
  if (itemCount === 0) {
    return (
      <div className="min-h-[70vh] bg-gray-50/50 py-12 sm:py-16">
        <Container size="md">
          <Card className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-white shadow-xs border-gray-100">
            <div className="h-20 w-20 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mb-5">
              <Heart className="h-10 w-10 text-brand-400" />
            </div>
            <Heading level={2} className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Your Wishlist is Empty
            </Heading>
            <Text className="text-gray-500 max-w-md mb-6 text-sm sm:text-base">
              Explore our curated handloom collections and tap the heart icon on pieces you adore to save them here for later.
            </Text>
            <Link href="/">
              <Button variant="primary" size="lg" className="rounded-xl px-8 gap-2">
                <Sparkles className="h-4 w-4" />
                Explore Collections
              </Button>
            </Link>
          </Card>
        </Container>
      </div>
    );
  }

  // 4. Authenticated Wishlist Grid
  return (
    <div className="min-h-[70vh] bg-gray-50/50 py-8 sm:py-12">
      <Container>
        {/* Page Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-200/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Heading level={1} className="text-2xl sm:text-3xl font-bold text-gray-900">
                My Wishlist
              </Heading>
              <Badge variant="brand" size="md" className="rounded-full px-2.5 py-0.5 font-bold">
                {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
              </Badge>
            </div>
            <Text className="text-xs sm:text-sm text-gray-500 mt-1">
              Items saved to your account are synced across all your devices.
            </Text>
          </div>

          <Link href="/">
            <Button variant="outline" size="sm" className="hidden sm:inline-flex rounded-lg text-xs gap-1">
              Continue Shopping
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => {
            const productHref = item.handle ? `/product/${item.handle}` : `/product/${item.productId}`;
            const discountPercent =
              item.originalPrice && item.price && item.originalPrice > item.price
                ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
                : 0;

            const isMoving = movingItemId === item.id;

            return (
              <Card
                key={item.id}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:shadow-md hover:border-brand-200"
              >
                {/* Thumbnail Anchor */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100 block">
                  <Link href={productHref} className="block w-full h-full">
                    {item.thumbnail ? (
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-300">
                        <ShoppingBag className="h-12 w-12 opacity-30 group-hover:scale-110 transition-transform" />
                      </div>
                    )}
                  </Link>

                  {/* Remove Button (Top Right) */}
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(item.id)}
                    aria-label={`Remove ${item.title} from wishlist`}
                    className="absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-500 shadow-xs backdrop-blur-xs transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  {/* Stock / Discount Badges */}
                  <div className="absolute left-2.5 top-2.5 flex flex-col gap-1 z-10 pointer-events-none">
                    {discountPercent > 0 && (
                      <Badge variant="brand" size="sm" className="font-bold text-[10px] tracking-wide uppercase shadow-xs">
                        {discountPercent}% OFF
                      </Badge>
                    )}
                    {item.inStock === false && (
                      <Badge variant="default" size="sm" className="bg-gray-900/80 text-white text-[10px] font-medium backdrop-blur-xs">
                        Out of Stock
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Card Details */}
                <div className="flex flex-1 flex-col p-3 sm:p-4">
                  <Link href={productHref} className="hover:text-brand-600 transition-colors">
                    <Text className="font-semibold text-gray-900 line-clamp-1 text-sm sm:text-base leading-snug">
                      {item.title}
                    </Text>
                  </Link>

                  {/* Price Row */}
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-bold text-gray-900 text-sm sm:text-base">
                      {typeof item.price === 'number' ? formatINR(item.price) : '₹---'}
                    </span>
                    {item.originalPrice && item.originalPrice > (item.price || 0) && (
                      <span className="text-xs text-gray-400 line-through">
                        {formatINR(item.originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* Action Button: Move to Bag */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={item.inStock === false || isMoving}
                      onClick={() => handleMoveToBag(item)}
                      className={cn(
                        'w-full rounded-lg font-medium text-xs gap-1.5',
                        item.inStock === false && 'bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-100'
                      )}
                    >
                      {isMoving ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Moving to Bag...
                        </>
                      ) : item.inStock === false ? (
                        'Out of Stock'
                      ) : (
                        <>
                          <ShoppingBag className="h-3.5 w-3.5" />
                          Move to Bag
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
