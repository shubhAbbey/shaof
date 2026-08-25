'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { CartDto } from '@ecom/types';

export interface CartContextType {
  cart: CartDto | null;
  itemCount: number;
  subtotal: number;
  total: number;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
  addToCart: (variantId: string, quantity?: number, metadata?: Record<string, any>) => Promise<boolean>;
  updateQuantity: (lineItemId: string, quantity: number) => Promise<boolean>;
  removeItem: (lineItemId: string) => Promise<boolean>;
  refreshCart: () => Promise<void>;
  clearError: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

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
        addToCart,
        updateQuantity,
        removeItem,
        refreshCart,
        clearError,
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
