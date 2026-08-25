import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { ProductDetail, ProductVariant } from '../../lib/commerce';
import { useToast } from '../ui/toast';
import { useCart } from '../../context/cart-context';
import { useWishlist } from '../../context/wishlist-context';

export interface UsePdpLogicOptions {
  product: ProductDetail;
  onAddToCartSuccess?: () => void;
}

export function usePdpLogic({ product, onAddToCartSuccess }: UsePdpLogicOptions) {
  const router = useRouter();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { isWishlisted: checkIsWishlisted, toggleWishlist } = useWishlist();



  // 1. Selected Options State
  // Initialize default selections from the first variant if available
  const initialOptions = useMemo<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    if (product.options && product.options.length > 0) {
      const firstVariant = product.variants?.[0];
      for (const opt of product.options) {
        if (firstVariant?.options?.[opt.title]) {
          defaults[opt.title] = firstVariant.options[opt.title];
        } else if (opt.values?.[0]?.value) {
          defaults[opt.title] = opt.values[0].value;
        }
      }
    }
    return defaults;
  }, [product]);

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(initialOptions);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1.5);
  const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false);
  const [isBuyingNow, setIsBuyingNow] = useState<boolean>(false);

  // Pincode estimation state

  const [pincode, setPincode] = useState<string>('');
  const [pincodeStatus, setPincodeStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [pincodeMessage, setPincodeMessage] = useState<string>('');

  // 2. Variant Resolution Logic
  const selectedVariant = useMemo<ProductVariant | null>(() => {
    if (!product.variants || product.variants.length === 0) {
      return null;
    }

    if (product.options.length === 0 || product.variants.length === 1) {
      return product.variants[0];
    }

    // Match all selected options against variant options
    const match = product.variants.find((v) => {
      return Object.entries(selectedOptions).every(([optTitle, optVal]) => {
        return v.options[optTitle] === optVal;
      });
    });

    return match || null;
  }, [product, selectedOptions]);

  // Pricing & Availability derivations
  const isAvailable = useMemo<boolean>(() => {
    if (product.variants && product.variants.length > 0) {
      return selectedVariant ? selectedVariant.inStock : false;
    }
    return product.inStock !== false;
  }, [product, selectedVariant]);

  const currentPrice = selectedVariant?.price ?? product.price;
  const currentOriginalPrice = selectedVariant?.originalPrice ?? product.originalPrice;
  const currentDiscountPercentage = selectedVariant?.discountPercentage ?? product.discountPercentage;
  const currentSku = selectedVariant?.sku || product.id;

  const isWishlisted = useMemo<boolean>(() => {
    const targetVariantId = selectedVariant?.id || product.defaultVariantId || product.variants?.[0]?.id;
    if (!targetVariantId) return false;
    return checkIsWishlisted(targetVariantId);
  }, [checkIsWishlisted, selectedVariant, product]);

  // Check if an option value combination is valid and available
  const isOptionValueAvailable = useCallback(
    (optionTitle: string, value: string): boolean => {
      if (!product.variants || product.variants.length === 0) return true;

      const hypothetical = { ...selectedOptions, [optionTitle]: value };
      const matchingVariant = product.variants.find((v) => {
        return Object.entries(hypothetical).every(([k, val]) => v.options[k] === val);
      });

      return matchingVariant ? matchingVariant.inStock : true;
    },
    [product, selectedOptions]
  );

  // Check if an option value exists in at least one variant
  const doesOptionValueExist = useCallback(
    (optionTitle: string, value: string): boolean => {
      if (!product.variants || product.variants.length === 0) return true;
      return product.variants.some((v) => v.options[optionTitle] === value);
    },
    [product]
  );

  // 3. Option Selection Handler
  const handleSelectOption = useCallback(
    (optionTitle: string, value: string) => {
      setSelectedOptions((prev) => {
        const next = { ...prev, [optionTitle]: value };
        return next;
      });

      // If this option is Color/Image mapped, find if a variant with this option has a thumbnail
      if (optionTitle.toLowerCase().includes('color')) {
        const matchingVar = product.variants.find((v) => v.options[optionTitle] === value && v.thumbnail);
        if (matchingVar && matchingVar.thumbnail) {
          const imgIdx = product.images.indexOf(matchingVar.thumbnail);
          if (imgIdx >= 0) {
            setActiveImageIndex(imgIdx);
          }
        }
      }
    },
    [product]
  );

  // 4. Add to Cart Handler
  const handleAddToCart = useCallback(async () => {
    if (product.options.length > 0 && !selectedVariant) {
      toast.warning('Choose your preferred size and color combination before adding to bag.', 'Please Select Options');
      return;
    }

    if (!isAvailable) {
      toast.error('This variant is temporarily unavailable. Please choose another option.', 'Currently Out of Stock');
      return;
    }

    if (isAddingToCart) return;

    setIsAddingToCart(true);

    try {
      const variantId = selectedVariant?.id || product.variants?.[0]?.id || product.id;
      const success = await addToCart(variantId, quantity);

      if (success) {
        const variantTitle = selectedVariant?.title && selectedVariant.title !== 'Default Variant'
          ? ` (${selectedVariant.title})`
          : '';

        toast.success(`${product.title}${variantTitle} added successfully.`, 'Added to Bag');

        if (onAddToCartSuccess) {
          onAddToCartSuccess();
        }
      }
    } catch (err: any) {
      toast.error(err?.message || 'Could not add item to bag. Please try again.', 'Failed to Add');
    } finally {
      setIsAddingToCart(false);
    }
  }, [product, selectedVariant, isAvailable, isAddingToCart, quantity, addToCart, toast, onAddToCartSuccess]);

  // 5. Buy Now Handler
  const handleBuyNow = useCallback(async () => {
    if (product.options.length > 0 && !selectedVariant) {
      toast.warning('Choose your preferred size and color combination to proceed.', 'Please Select Options');
      return;
    }

    if (!isAvailable) {
      toast.error('This variant is currently out of stock.', 'Out of Stock');
      return;
    }

    if (isBuyingNow) return;

    setIsBuyingNow(true);

    try {
      const variantId = selectedVariant?.id || product.variants?.[0]?.id || product.id;
      const success = await addToCart(variantId, quantity);
      if (success) {
        toast.info(`Proceeding to bag with ${product.title}.`, 'Added to Bag');
        router.push('/cart');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Checkout could not be started.', 'Unable to Proceed');
    } finally {
      setIsBuyingNow(false);
    }
  }, [product, selectedVariant, isAvailable, isBuyingNow, quantity, addToCart, toast, router]);


  // 6. Wishlist Handler
  const handleToggleWishlist = useCallback(async () => {
    const targetVariantId = selectedVariant?.id || product.defaultVariantId || product.variants?.[0]?.id;
    if (!targetVariantId) {
      toast.warning('Please select your preferred options before adding to wishlist.', 'Options Required');
      return;
    }

    await toggleWishlist({
      productId: product.id,
      variantId: targetVariantId,
      title: product.title,
      handle: product.handle,
      thumbnail: selectedVariant?.thumbnail || product.images?.[0] || product.thumbnail || undefined,
      price: selectedVariant?.price ?? product.price,
      originalPrice: selectedVariant?.originalPrice ?? product.originalPrice,
      currencyCode: 'INR',
      inStock: isAvailable,
      options: selectedOptions,
    });
  }, [product, selectedVariant, isAvailable, selectedOptions, toggleWishlist, toast]);



  // 7. Pincode Validation Handler
  const handleCheckPincode = useCallback((code: string) => {
    setPincode(code);
    const cleaned = code.trim();
    if (!cleaned) {
      setPincodeStatus('idle');
      setPincodeMessage('');
      return;
    }

    if (!/^[1-9][0-9]{5}$/.test(cleaned)) {
      setPincodeStatus('invalid');
      setPincodeMessage('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    setPincodeStatus('checking');
    setTimeout(() => {
      setPincodeStatus('valid');
      setPincodeMessage('Delivery available in 3-5 business days. Cash on Delivery available.');
    }, 400);
  }, []);

  return {
    selectedOptions,
    selectedVariant,
    isAvailable,
    currentPrice,
    currentOriginalPrice,
    currentDiscountPercentage,
    currentSku,
    activeImageIndex,
    setActiveImageIndex,
    quantity,
    setQuantity,
    isZoomed,
    setIsZoomed,
    zoomLevel,
    setZoomLevel,
    isAddingToCart,
    isBuyingNow,
    isWishlisted,
    pincode,
    pincodeStatus,
    pincodeMessage,
    handleSelectOption,
    isOptionValueAvailable,
    doesOptionValueExist,
    handleAddToCart,
    handleBuyNow,
    handleToggleWishlist,
    handleCheckPincode,
  };
}
