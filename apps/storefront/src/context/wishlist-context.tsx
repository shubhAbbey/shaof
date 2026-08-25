'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import type { WishlistItemDto, WishlistDto } from '@ecom/types';
import { useAuth } from './auth-context';
import { useToast } from '../components/ui/toast';

export interface AddToWishlistParams {
  productId: string;
  variantId: string;
  title: string;
  handle?: string;
  thumbnail?: string;
  price?: number;
  originalPrice?: number;
  currencyCode?: string;
  inStock?: boolean;
  options?: Record<string, string>;
}

export interface WishlistContextType {
  wishlist: WishlistDto | null;
  items: WishlistItemDto[];
  itemCount: number;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
  isWishlisted: (variantIdOrItemId: string) => boolean;
  isVariantWishlisted: (variantId: string) => boolean;
  addToWishlist: (item: AddToWishlistParams) => Promise<boolean>;
  removeFromWishlist: (idOrVariantId: string) => Promise<boolean>;
  toggleWishlist: (item: AddToWishlistParams) => Promise<boolean>;
  refreshWishlist: () => Promise<void>;
  clearError: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, openLogin } = useAuth();
  const { toast } = useToast();

  const [wishlist, setWishlist] = useState<WishlistDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const items = useMemo(() => wishlist?.items || [], [wishlist]);
  const itemCount = useMemo(() => wishlist?.itemCount || 0, [wishlist]);

  // Set of wishlisted variant and item IDs for fast O(1) exact-variant lookups
  const wishlistedVariantIds = useMemo(() => {
    const set = new Set<string>();
    for (const item of items) {
      if (item.variantId) set.add(item.variantId);
      if (item.id) set.add(item.id);
    }
    return set;
  }, [items]);

  const isWishlisted = useCallback(
    (variantIdOrItemId: string): boolean => {
      if (!isAuthenticated || !variantIdOrItemId) return false;
      if (variantIdOrItemId.startsWith('prod_')) return false; // Strict variant identity
      return wishlistedVariantIds.has(variantIdOrItemId);
    },
    [isAuthenticated, wishlistedVariantIds]
  );

  const isVariantWishlisted = useCallback(
    (variantId: string): boolean => {
      if (!isAuthenticated || !variantId) return false;
      if (variantId.startsWith('prod_')) return false;
      return wishlistedVariantIds.has(variantId);
    },
    [isAuthenticated, wishlistedVariantIds]
  );

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/wishlist', {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' },
      });

      if (!res.ok) {
        if (res.status === 401) {
          setWishlist(null);
          return;
        }
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to fetch wishlist');
      }

      const data = await res.json();
      if (data.wishlist) {
        setWishlist(data.wishlist);
      }
    } catch (err: any) {
      console.error('[WishlistContext] fetchWishlist error:', err);
      setError(err.message || 'Failed to load wishlist');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const refreshWishlist = useCallback(async () => {
    await fetchWishlist();
  }, [fetchWishlist]);

  const addToWishlist = useCallback(
    async (item: AddToWishlistParams): Promise<boolean> => {
      if (!isAuthenticated) {
        openLogin('/wishlist');
        toast.info('Please sign in to save items to your wishlist.', 'Sign In Required');
        return false;
      }

      if (!item.variantId || item.variantId.startsWith('prod_')) {
        toast.warning('Please select your preferred options before adding to wishlist.', 'Variant Required');
        return false;
      }

      setIsMutating(true);
      setError(null);

      // Snapshot for rollback
      const previousWishlist = wishlist;

      // Optimistic addition
      const optimisticItem: WishlistItemDto = {
        id: `opt_${Date.now()}`,
        customerId: wishlist?.customerId || 'current',
        productId: item.productId,
        variantId: item.variantId,
        title: item.title,
        handle: item.handle,
        thumbnail: item.thumbnail,
        price: item.price,
        originalPrice: item.originalPrice,
        currencyCode: item.currencyCode || 'INR',
        inStock: item.inStock !== false,
        options: item.options || {},
        createdAt: new Date().toISOString(),
      };

      const currentItems = items.filter((i) => i.variantId !== item.variantId);
      const updatedItems = [optimisticItem, ...currentItems];

      setWishlist({
        customerId: wishlist?.customerId || 'current',
        items: updatedItems,
        itemCount: updatedItems.length,
        updatedAt: new Date().toISOString(),
      });

      try {
        const res = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: item.productId,
            variantId: item.variantId,
            title: item.title,
            handle: item.handle,
            thumbnail: item.thumbnail,
            price: item.price,
            originalPrice: item.originalPrice,
            currencyCode: item.currencyCode,
            inStock: item.inStock,
            options: item.options,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Failed to add item to wishlist');
        }

        const data = await res.json();
        if (data.wishlist) {
          setWishlist(data.wishlist);
        }

        toast.success(`${item.title} added to your wishlist.`, 'Saved to Wishlist');
        return true;
      } catch (err: any) {
        // Rollback on failure
        setWishlist(previousWishlist);
        setError(err.message || 'Could not add item to wishlist');
        toast.error(err.message || 'Failed to save item. Please try again.', 'Error');
        return false;
      } finally {
        setIsMutating(false);
      }
    },
    [isAuthenticated, openLogin, toast, wishlist, items]
  );

  const removeFromWishlist = useCallback(
    async (idOrVariantId: string): Promise<boolean> => {
      if (!isAuthenticated || !idOrVariantId) return false;

      setIsMutating(true);
      setError(null);

      // Snapshot for rollback
      const previousWishlist = wishlist;

      // Find item title for toast notification
      const targetItem = items.find(
        (i) => i.id === idOrVariantId || i.variantId === idOrVariantId
      );
      const itemTitle = targetItem?.title || 'Item';

      // Optimistic removal (strictly by exact item ID or variant ID)
      const updatedItems = items.filter(
        (i) => i.id !== idOrVariantId && i.variantId !== idOrVariantId
      );
      setWishlist({
        customerId: wishlist?.customerId || 'current',
        items: updatedItems,
        itemCount: updatedItems.length,
        updatedAt: new Date().toISOString(),
      });

      try {
        const res = await fetch(`/api/wishlist/${encodeURIComponent(idOrVariantId)}`, {
          method: 'DELETE',
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Failed to remove item from wishlist');
        }

        const data = await res.json();
        if (data.wishlist) {
          setWishlist(data.wishlist);
        }

        toast.info(`${itemTitle} removed from your wishlist.`, 'Removed from Wishlist');
        return true;
      } catch (err: any) {
        // Rollback on failure
        setWishlist(previousWishlist);
        setError(err.message || 'Could not remove item from wishlist');
        toast.error(err.message || 'Failed to remove item. Please try again.', 'Error');
        return false;
      } finally {
        setIsMutating(false);
      }
    },
    [isAuthenticated, wishlist, items, toast]
  );

  const toggleWishlist = useCallback(
    async (item: AddToWishlistParams): Promise<boolean> => {
      if (!isAuthenticated) {
        openLogin('/wishlist');
        toast.info('Please sign in to save items to your wishlist.', 'Sign In Required');
        return false;
      }

      if (!item.variantId || item.variantId.startsWith('prod_')) {
        toast.warning('Please select your preferred options before saving to wishlist.', 'Options Required');
        return false;
      }

      if (isWishlisted(item.variantId)) {
        return removeFromWishlist(item.variantId);
      } else {
        return addToWishlist(item);
      }
    },
    [isAuthenticated, isWishlisted, openLogin, toast, removeFromWishlist, addToWishlist]
  );

  const contextValue = useMemo<WishlistContextType>(
    () => ({
      wishlist,
      items,
      itemCount,
      isLoading,
      isMutating,
      error,
      isWishlisted,
      isVariantWishlisted,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      refreshWishlist,
      clearError,
    }),
    [
      wishlist,
      items,
      itemCount,
      isLoading,
      isMutating,
      error,
      isWishlisted,
      isVariantWishlisted,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      refreshWishlist,
      clearError,
    ]
  );

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
