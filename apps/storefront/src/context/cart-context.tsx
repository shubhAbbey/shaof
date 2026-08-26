'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { CartDto, ShippingOptionDto } from '@ecom/types';

export interface CartContextType {
  cart: CartDto | null;
  itemCount: number;
  subtotal: number;
  total: number;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
  shippingOptions: ShippingOptionDto[];
  selectedShippingOptionId: string | null;
  isLoadingShipping: boolean;
  shippingError: string | null;
  addToCart: (variantId: string, quantity?: number, metadata?: Record<string, any>) => Promise<boolean>;
  updateQuantity: (lineItemId: string, quantity: number) => Promise<boolean>;
  removeItem: (lineItemId: string) => Promise<boolean>;
  fetchShippingOptions: () => Promise<ShippingOptionDto[]>;
  setShippingMethod: (optionId: string) => Promise<boolean>;
  refreshCart: () => Promise<void>;
  clearError: () => void;
  clearShippingError: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [shippingOptions, setShippingOptions] = useState<ShippingOptionDto[]>([]);
  const [isLoadingShipping, setIsLoadingShipping] = useState<boolean>(false);
  const [shippingError, setShippingError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);
  const clearShippingError = useCallback(() => setShippingError(null), []);

  const refreshCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/cart', {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const data = await res.json();
        setCart(data.cart || null);
      } else {
        setCart(null);
      }
    } catch (err: any) {
      console.warn('[CartContext] Failed to load cart:', err);
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchShippingOptions = useCallback(async (): Promise<ShippingOptionDto[]> => {
    try {
      setIsLoadingShipping(true);
      setShippingError(null);

      const res = await fetch('/api/cart/shipping-options', {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' },
      });

      if (res.ok) {
        const data = await res.json();
        const options = data.shippingOptions || [];
        setShippingOptions(options);
        return options;
      } else {
        setShippingOptions([]);
        return [];
      }
    } catch (err: any) {
      console.warn('[CartContext] Failed to fetch shipping options:', err);
      setShippingOptions([]);
      return [];
    } finally {
      setIsLoadingShipping(false);
    }
  }, []);

  const setShippingMethod = useCallback(async (optionId: string): Promise<boolean> => {
    try {
      setIsMutating(true);
      setShippingError(null);

      const res = await fetch('/api/cart/shipping-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId }),
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.cart) {
        const errMsg = data.message || data.error || 'Failed to select shipping method';
        setShippingError(errMsg);
        return false;
      }

      setCart(data.cart);
      return true;
    } catch (err: any) {
      setShippingError(err?.message || 'Network error while selecting shipping method');
      return false;
    } finally {
      setIsMutating(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();

    const handleAuthChange = () => {
      refreshCart();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('ecom:auth_change', handleAuthChange);
      return () => {
        window.removeEventListener('ecom:auth_change', handleAuthChange);
      };
    }
  }, [refreshCart]);

  useEffect(() => {
    if (cart?.shippingAddress) {
      fetchShippingOptions();
    } else {
      setShippingOptions([]);
    }
  }, [cart?.shippingAddress, fetchShippingOptions]);

  const addToCart = useCallback(
    async (variantId: string, quantity: number = 1, metadata?: Record<string, any>): Promise<boolean> => {
      try {
        setIsMutating(true);
        setError(null);

        const res = await fetch('/api/cart/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ variantId, quantity, metadata }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          const errMsg = data.message || data.error || 'Failed to add item to cart';
          setError(errMsg);
          return false;
        }

        setCart(data.cart);
        return true;
      } catch (err: any) {
        setError(err?.message || 'Network error while adding to bag');
        return false;
      } finally {
        setIsMutating(false);
      }
    },
    []
  );

  const updateQuantity = useCallback(
    async (lineItemId: string, quantity: number): Promise<boolean> => {
      try {
        setIsMutating(true);
        setError(null);

        const res = await fetch(`/api/cart/items/${encodeURIComponent(lineItemId)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          const errMsg = data.message || data.error || 'Failed to update quantity';
          setError(errMsg);
          return false;
        }

        setCart(data.cart);
        return true;
      } catch (err: any) {
        setError(err?.message || 'Network error while updating quantity');
        return false;
      } finally {
        setIsMutating(false);
      }
    },
    []
  );

  const removeItem = useCallback(async (lineItemId: string): Promise<boolean> => {
    try {
      setIsMutating(true);
      setError(null);

      const res = await fetch(`/api/cart/items/${encodeURIComponent(lineItemId)}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const errMsg = data.message || data.error || 'Failed to remove item';
        setError(errMsg);
        return false;
      }

      setCart(data.cart);
      return true;
    } catch (err: any) {
      setError(err?.message || 'Network error while removing item');
      return false;
    } finally {
      setIsMutating(false);
    }
  }, []);

  const selectedShippingOptionId =
    cart?.shippingMethods && cart.shippingMethods.length > 0
      ? cart.shippingMethods[0].shippingOptionId || cart.shippingMethods[0].id
      : null;

  const itemCount = cart?.totalItems ?? 0;
  const subtotal = cart?.subtotal ?? 0;
  const total = cart?.total ?? 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        subtotal,
        total,
        isLoading,
        isMutating,
        error,
        shippingOptions,
        selectedShippingOptionId,
        isLoadingShipping,
        shippingError,
        addToCart,
        updateQuantity,
        removeItem,
        fetchShippingOptions,
        setShippingMethod,
        refreshCart,
        clearError,
        clearShippingError,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
