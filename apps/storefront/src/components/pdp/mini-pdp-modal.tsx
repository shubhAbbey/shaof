'use client';

import React from 'react';
import Link from 'next/link';
import { useMiniPdp } from '../../context/mini-pdp-context';
import { usePdpLogic } from './use-pdp-logic';
import { PdpImageGallery } from './pdp-image-gallery';
import { PdpVariantSelector } from './pdp-variant-selector';
import { Dialog } from '../ui/dialog';
import { Drawer } from '../ui/drawer';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { formatINR, cn } from '../../lib/utils';
import { ShoppingBag, Zap, Heart, ArrowRight, Loader2, Sparkles } from 'lucide-react';

export const MiniPdpModal: React.FC = () => {
  const { isOpen, detailedProduct, isLoading, closeMiniPdp } = useMiniPdp();

  if (!isOpen || !detailedProduct) return null;

  return <MiniPdpContent product={detailedProduct} isLoading={isLoading} onClose={closeMiniPdp} />;
};

const MiniPdpContent: React.FC<{
  product: any;
  isLoading: boolean;
  onClose: () => void;
}> = ({ product, isLoading, onClose }) => {
  const pdp = usePdpLogic({
    product,
    onAddToCartSuccess: onClose,
  });

  const colorOption = product.options?.find(
    (opt: any) => opt.title.toLowerCase().includes('color') || opt.title.toLowerCase().includes('shade')
  );

  return (
    <>
      {/* Desktop Modal View (md and above) */}
      <div className="hidden md:block">
        <Dialog
          isOpen={true}
          onClose={onClose}
          size="lg"
          className="max-w-3xl p-6"
        >
          <div className="grid grid-cols-12 gap-6 items-start">
            {/* Left: Compact Gallery */}
            <div className="col-span-5">
              <PdpImageGallery
                images={product.images}
                title={product.title}
                activeImageIndex={pdp.activeImageIndex}
                onSelectImage={pdp.setActiveImageIndex}
                isCompact
                colorOption={
                  colorOption
                    ? {
                        title: colorOption.title,
                        values: colorOption.values.map((v: any) => v.value),
                        selectedValue: pdp.selectedOptions[colorOption.title],
                        onSelectColor: (color: string) => pdp.handleSelectOption(colorOption.title, color),
                      }
                    : undefined
                }
              />
            </div>

            {/* Right: Compact Buy Box */}
            <div className="col-span-7 flex flex-col gap-3">
              {/* Brand & Stock Header */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-500 uppercase tracking-wider">
                  {product.brand || product.categoryName || 'Fashion'}
                </span>
                {pdp.isAvailable ? (
                  <Badge variant="success" size="sm">In Stock</Badge>
                ) : (
                  <Badge variant="outline" size="sm" className="text-red-600 border-red-200">Out of Stock</Badge>
                )}
              </div>

              {/* Title */}
              <h3 className="text-base sm:text-lg font-bold text-gray-950 leading-snug">
                {product.title}
              </h3>

              {/* Price Row */}
              <div className="flex items-baseline gap-2.5">
                <span className="text-xl font-black text-gray-950">
                  {formatINR(pdp.currentPrice)}
                </span>
                {pdp.currentOriginalPrice && pdp.currentOriginalPrice > pdp.currentPrice && (
                  <span className="text-xs text-gray-400 line-through">
                    {formatINR(pdp.currentOriginalPrice)}
                  </span>
                )}
                {pdp.currentDiscountPercentage && pdp.currentDiscountPercentage > 0 && (
                  <Badge variant="brand" size="sm" className="font-bold">
                    -{pdp.currentDiscountPercentage}% OFF
                  </Badge>
                )}
              </div>

              {/* Short Description */}
              {product.description && (
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Variant Selector */}
              <div className="pt-2 border-t border-gray-100">
                <PdpVariantSelector
                  options={product.options}
                  selectedOptions={pdp.selectedOptions}
                  onSelectOption={pdp.handleSelectOption}
                  isOptionValueAvailable={pdp.isOptionValueAvailable}
                  doesOptionValueExist={pdp.doesOptionValueExist}
                  isCompact
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 mt-auto border-t border-gray-100">
                <Button
                  variant="primary"
                  size="md"
                  onClick={pdp.handleAddToCart}
                  disabled={!pdp.isAvailable || pdp.isAddingToCart}
                  className="flex-1 font-bold"
                >
                  {pdp.isAddingToCart ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  ) : (
                    <ShoppingBag className="h-4 w-4 mr-1.5" />
                  )}
                  {pdp.isAddingToCart ? 'Adding...' : 'Add to Bag'}
                </Button>

                <Button
                  variant="secondary"
                  size="md"
                  onClick={pdp.handleBuyNow}
                  disabled={!pdp.isAvailable || pdp.isBuyingNow}
                  className="flex-1 font-bold bg-gray-900 text-white hover:bg-gray-800"
                >
                  <Zap className="h-4 w-4 mr-1.5 text-amber-400" />
                  Buy Now
                </Button>

                <button
                  type="button"
                  onClick={pdp.handleToggleWishlist}
                  aria-label="Wishlist"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:text-brand-600 hover:border-brand-300 transition-colors"
                >
                  <Heart className={cn('h-4 w-4', pdp.isWishlisted && 'fill-brand-600 text-brand-600')} />
                </button>
              </div>

              {/* Full PDP Link */}
              <Link
                href={`/product/${product.handle}`}
                onClick={onClose}
                className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 pt-1 text-center"
              >
                <span>View Full Product Details</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </Dialog>
      </div>

      {/* Mobile Bottom Drawer View (< md / 768px) */}
      <div className="block md:hidden">
        <Drawer
          isOpen={true}
          onClose={onClose}
          position="bottom"
          size="full"
          className="max-h-[80vh] rounded-t-3xl overflow-hidden flex flex-col p-0"
        >
          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Top: Mobile Main Image with Swipe */}
            <div className="max-w-[280px] mx-auto">
              <PdpImageGallery
                images={product.images}
                title={product.title}
                activeImageIndex={pdp.activeImageIndex}
                onSelectImage={pdp.setActiveImageIndex}
                isCompact
                colorOption={
                  colorOption
                    ? {
                        title: colorOption.title,
                        values: colorOption.values.map((v: any) => v.value),
                        selectedValue: pdp.selectedOptions[colorOption.title],
                        onSelectColor: (color: string) => pdp.handleSelectOption(colorOption.title, color),
                      }
                    : undefined
                }
              />
            </div>

            {/* Dedicated Future Strip / Banner Area */}
            <div
              data-testid="future-strip-area"
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-brand-50/60 border border-brand-100/80 text-[11px] font-semibold text-brand-800"
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-brand-600" />
                <span>Special Festive Offer Available</span>
              </div>
              <span className="text-[10px] text-brand-600 underline">Details</span>
            </div>

            {/* Product Meta */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                <span>{product.brand || product.categoryName || 'Fashion'}</span>
                {pdp.isAvailable ? (
                  <span className="text-emerald-600 font-bold">In Stock</span>
                ) : (
                  <span className="text-red-600 font-bold">Out of Stock</span>
                )}
              </div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-snug">
                {product.title}
              </h3>

              {/* Price Block */}
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-lg font-black text-gray-950">
                  {formatINR(pdp.currentPrice)}
                </span>
                {pdp.currentOriginalPrice && pdp.currentOriginalPrice > pdp.currentPrice && (
                  <span className="text-xs text-gray-400 line-through">
                    {formatINR(pdp.currentOriginalPrice)}
                  </span>
                )}
                {pdp.currentDiscountPercentage && pdp.currentDiscountPercentage > 0 && (
                  <Badge variant="brand" size="sm" className="font-bold">
                    -{pdp.currentDiscountPercentage}% OFF
                  </Badge>
                )}
              </div>
            </div>

            {/* Variant Selector */}
            <PdpVariantSelector
              options={product.options}
              selectedOptions={pdp.selectedOptions}
              onSelectOption={pdp.handleSelectOption}
              isOptionValueAvailable={pdp.isOptionValueAvailable}
              doesOptionValueExist={pdp.doesOptionValueExist}
              isCompact
            />

            {/* Link to Full Page */}
            <div className="text-center pt-2">
              <Link
                href={`/product/${product.handle}`}
                onClick={onClose}
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline"
              >
                <span>View Complete Specifications & Details</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Sticky Bottom Actions */}
          <div className="border-t border-gray-100 bg-white p-3 flex items-center gap-2">
            <Button
              variant="primary"
              size="md"
              onClick={pdp.handleAddToCart}
              disabled={!pdp.isAvailable || pdp.isAddingToCart}
              className="flex-1 font-bold"
            >
              {pdp.isAddingToCart ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <ShoppingBag className="h-4 w-4 mr-1" />
              )}
              {pdp.isAddingToCart ? 'Adding...' : 'Add to Bag'}
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={pdp.handleBuyNow}
              disabled={!pdp.isAvailable || pdp.isBuyingNow}
              className="flex-1 font-bold bg-gray-900 text-white hover:bg-gray-800"
            >
              <Zap className="h-4 w-4 mr-1 text-amber-400" />
              Buy Now
            </Button>
          </div>
        </Drawer>
      </div>
    </>
  );
};
