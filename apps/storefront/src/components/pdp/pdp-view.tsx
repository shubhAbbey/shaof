'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { ProductDetail, StorefrontProduct } from '../../lib/commerce';
import { usePdpLogic } from './use-pdp-logic';
import { PdpImageGallery } from './pdp-image-gallery';
import { PdpVariantSelector } from './pdp-variant-selector';
import { PdpDetailsTabs } from './pdp-details-tabs';
import { Container } from '../ui/container';
import { Heading, Text } from '../ui/typography';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { MobileBackButton } from '../ui/mobile-back-button';
import { ProductCard } from '../sections/product-card';
import { HorizontalItemScroller } from '../ui/horizontal-item-scroller';
import { formatINR } from '../../lib/utils';
import { cn } from '../../lib/utils';
import { config } from '../../config';
import {
  ShoppingBag,
  Zap,
  Heart,
  Share2,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  MapPin,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export interface PdpViewProps {
  product: ProductDetail;
  relatedProducts?: StorefrontProduct[];
}

export const PdpView: React.FC<PdpViewProps> = ({ product, relatedProducts = [] }) => {
  const pdp = usePdpLogic({ product });
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const handleShare = async () => {
    const canonicalUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/product/${product.handle}`
        : `${config.site.url}/product/${product.handle}`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Explore ${product.title} on ${config.site.name}`,
          url: canonicalUrl,
        });
        return;
      } catch (err: any) {
        // Ignore user cancellation (AbortError)
        if (err.name === 'AbortError') return;
      }
    }

    // Fallback: Clipboard copy
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(canonicalUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = canonicalUrl;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setShareFeedback('Link copied to clipboard!');
      setTimeout(() => setShareFeedback(null), 3000);
    } catch (err) {
      console.error('Failed to copy share URL:', err);
      setShareFeedback('Unable to copy link');
      setTimeout(() => setShareFeedback(null), 3000);
    }
  };

  const fallbackCategoryUrl = product.categoryHandle
    ? `/category/${product.categoryHandle}`
    : '/';

  return (
    <div className="min-h-screen bg-white pb-16">
      {/* 1. Breadcrumbs & Mobile Back Header */}
      <div className="border-b border-gray-100 bg-gray-50/50 py-3">
        <Container size="xl">
          <div className="flex items-center justify-between">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-gray-500 overflow-x-auto scrollbar-none">
              {/* Mobile Back Button (Mobile only) */}
              <div className="sm:hidden mr-1 shrink-0">
                <MobileBackButton fallbackUrl={fallbackCategoryUrl} />
              </div>

              <Link href="/" className="hover:text-gray-900 transition-colors shrink-0">
                Home
              </Link>
              <ChevronRight className="h-3 w-3 flex-shrink-0 text-gray-400" />
              {product.categoryHierarchy && product.categoryHierarchy.length > 0 ? (
                product.categoryHierarchy.map((cat, idx) => (
                  <React.Fragment key={cat.handle}>
                    <Link href={`/category/${cat.handle}`} className="hover:text-gray-900 transition-colors shrink-0">
                      {cat.name}
                    </Link>
                    <ChevronRight className="h-3 w-3 flex-shrink-0 text-gray-400" />
                  </React.Fragment>
                ))
              ) : product.categoryName ? (
                <>
                  <Link href={`/category/${product.categoryHandle || 'women'}`} className="hover:text-gray-900 transition-colors shrink-0">
                    {product.categoryName}
                  </Link>
                  <ChevronRight className="h-3 w-3 flex-shrink-0 text-gray-400" />
                </>
              ) : null}
              <span className="font-semibold text-gray-900 truncate max-w-[160px] sm:max-w-[240px] md:max-w-none">
                {product.title}
              </span>
            </nav>

            {/* Quick Share action on Breadcrumb bar */}
            <button
              type="button"
              onClick={handleShare}
              data-testid="pdp-share-top-btn"
              aria-label="Share product"
              className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-200/60 rounded-md transition-colors shrink-0 ml-2"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </Container>
      </div>

      {/* 2. Main Product Grid Section */}
      <Container size="xl" className="pt-6 sm:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Image Gallery (7 cols on desktop) */}
          <div className="lg:col-span-7">
            {(() => {
              const colorOpt = product.options?.find(
                (opt) => opt.title.toLowerCase().includes('color') || opt.title.toLowerCase().includes('shade')
              );
              return (
                <PdpImageGallery
                  images={product.images}
                  title={product.title}
                  activeImageIndex={pdp.activeImageIndex}
                  onSelectImage={pdp.setActiveImageIndex}
                  colorOption={
                    colorOpt
                      ? {
                          title: colorOpt.title,
                          values: colorOpt.values.map((v) => v.value),
                          selectedValue: pdp.selectedOptions[colorOpt.title],
                          onSelectColor: (color) => pdp.handleSelectOption(colorOpt.title, color),
                        }
                      : undefined
                  }
                />
              );
            })()}
          </div>

          {/* Right Column: Buy Box & Product Info (5 cols on desktop) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Brand & Stock Status */}
            <div className="flex items-center justify-between">
              {product.brand ? (
                <Link
                  href={`/brand/${product.brand.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-xs font-bold uppercase tracking-widest text-brand-600 hover:text-brand-700"
                >
                  {product.brand}
                </Link>
              ) : (
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  {product.categoryName || 'Authentic Fashion'}
                </span>
              )}

              {pdp.isAvailable ? (
                <Badge variant="success" size="sm" className="font-bold">
                  IN STOCK
                </Badge>
              ) : (
                <Badge variant="outline" size="sm" className="font-bold text-red-600 border-red-200">
                  OUT OF STOCK
                </Badge>
              )}
            </div>

            {/* Product Title */}
            <Heading level={1} size="xl" className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-950 tracking-tight leading-tight">
              {product.title}
            </Heading>

            {/* Price Block */}
            <div className="flex flex-col gap-1 pb-4 border-b border-gray-100">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-black text-gray-950">
                  {formatINR(pdp.currentPrice)}
                </span>
                {pdp.currentOriginalPrice && pdp.currentOriginalPrice > pdp.currentPrice && (
                  <span className="text-base text-gray-400 line-through">
                    {formatINR(pdp.currentOriginalPrice)}
                  </span>
                )}
                {pdp.currentDiscountPercentage && pdp.currentDiscountPercentage > 0 && (
                  <Badge variant="brand" size="md" className="font-bold">
                    -{pdp.currentDiscountPercentage}% OFF
                  </Badge>
                )}
              </div>
              <span className="text-xs text-gray-500 font-medium">Inclusive of all taxes</span>
            </div>

            {/* Options & Variants Selector */}
            <PdpVariantSelector
              options={product.options}
              selectedOptions={pdp.selectedOptions}
              onSelectOption={pdp.handleSelectOption}
              isOptionValueAvailable={pdp.isOptionValueAvailable}
              doesOptionValueExist={pdp.doesOptionValueExist}
            />

            {/* Primary Action Button Cluster */}
            <div className="flex flex-col sm:flex-row gap-3 pt-3">
              <Button
                variant="primary"
                size="lg"
                onClick={pdp.handleAddToCart}
                disabled={!pdp.isAvailable || pdp.isAddingToCart}
                className="flex-1 font-bold text-base shadow-md hover:shadow-lg"
              >
                {pdp.isAddingToCart ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <ShoppingBag className="h-5 w-5 mr-2" />
                )}
                {pdp.isAddingToCart ? 'Adding to Bag...' : 'Add to Bag'}
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={pdp.handleBuyNow}
                disabled={!pdp.isAvailable || pdp.isBuyingNow}
                className="flex-1 font-bold text-base bg-gray-950 text-white hover:bg-gray-800 shadow-md"
              >
                <Zap className="h-5 w-5 mr-2 text-amber-400" />
                Buy Now
              </Button>

              <button
                type="button"
                onClick={pdp.handleToggleWishlist}
                disabled={pdp.isWishlisting}
                aria-label="Add to wishlist"
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-xl border transition-all shrink-0',
                  pdp.isWishlisting && 'opacity-60 cursor-not-allowed',
                  pdp.isWishlisted
                    ? 'border-brand-600 bg-brand-50 text-brand-600 ring-2 ring-brand-500/20'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-brand-300 hover:text-brand-600 hover:bg-gray-50'
                )}
              >
                {pdp.isWishlisting ? (
                  <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
                ) : (
                  <Heart className={cn('h-5 w-5', pdp.isWishlisted && 'fill-brand-600')} />
                )}
              </button>

              <button
                type="button"
                onClick={handleShare}
                data-testid="pdp-share-btn"
                aria-label="Share this product"
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-xl border transition-all shrink-0',
                  shareFeedback
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-600 ring-2 ring-emerald-500/20'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-brand-300 hover:text-brand-600 hover:bg-gray-50'
                )}
              >
                {shareFeedback ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : (
                  <Share2 className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Share Feedback Toast */}
            {shareFeedback && (
              <div
                data-testid="pdp-share-toast"
                role="status"
                className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3.5 py-2 text-xs font-semibold text-emerald-800 animate-fadeIn shadow-2xs"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{shareFeedback}</span>
              </div>
            )}

            {/* Pincode & Delivery Checker */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-2 mt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-800 uppercase tracking-wider">
                <MapPin className="h-4 w-4 text-brand-600" />
                <span>Delivery & Services</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit Pincode"
                  value={pdp.pincode}
                  onChange={(e) => pdp.handleCheckPincode(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <button
                  type="button"
                  onClick={() => pdp.handleCheckPincode(pdp.pincode)}
                  className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-gray-800 transition-colors"
                >
                  Check
                </button>
              </div>
              {pdp.pincodeStatus === 'valid' && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold pt-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{pdp.pincodeMessage}</span>
                </div>
              )}
              {pdp.pincodeStatus === 'invalid' && (
                <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium pt-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{pdp.pincodeMessage}</span>
                </div>
              )}
            </div>

            {/* Assurance Badges Strip */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                <ShieldCheck className="h-4 w-4 text-brand-600" />
                <span>100% Authentic Handcrafted</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                <RotateCcw className="h-4 w-4 text-brand-600" />
                <span>Easy 7-Day Free Returns</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                <Truck className="h-4 w-4 text-brand-600" />
                <span>Free Shipping Available</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                <Sparkles className="h-4 w-4 text-brand-600" />
                <span>Cash on Delivery Available</span>
              </div>
            </div>

            {/* Details & Specs Tabs */}
            <PdpDetailsTabs product={product} />
          </div>
        </div>

        {/* 3. Related Products Section */}
        {relatedProducts && relatedProducts.length > 0 && (
          <section className="mt-16 sm:mt-24 border-t border-gray-100 pt-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <Heading level={2} size="lg" className="text-xl sm:text-2xl font-black text-gray-950">
                  You May Also Like
                </Heading>
                <Text className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  Handpicked styles curated to complement your look.
                </Text>
              </div>
              {product.categoryHandle && (
                <Link
                  href={`/category/${product.categoryHandle}`}
                  className="text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 underline"
                >
                  View All
                </Link>
              )}
            </div>

            <HorizontalItemScroller
              desktopVisibleItems={4}
              mobileVisibleItems={2}
            >
              {relatedProducts.map((relProduct) => (
                <div key={relProduct.id} className="min-w-0">
                  <ProductCard product={relProduct} />
                </div>
              ))}
            </HorizontalItemScroller>
          </section>
        )}
      </Container>
    </div>
  );
};
PdpView.displayName = 'PdpView';
