'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { StorefrontProduct, ProductDetail } from '../lib/commerce';

interface MiniPdpContextValue {
  isOpen: boolean;
  activeProduct: StorefrontProduct | null;
  detailedProduct: ProductDetail | null;
  isLoading: boolean;
  openMiniPdp: (product: StorefrontProduct) => void;
  closeMiniPdp: () => void;
}

const MiniPdpContext = createContext<MiniPdpContextValue | null>(null);

export const MiniPdpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<StorefrontProduct | null>(null);
  const [detailedProduct, setDetailedProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const openMiniPdp = useCallback(async (product: StorefrontProduct) => {
    setActiveProduct(product);
    setIsOpen(true);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/products/${encodeURIComponent(product.handle)}`);
      if (res.ok) {
        const data: ProductDetail = await res.json();
        setDetailedProduct(data);
      } else {
        // Fallback to base product structure
        setDetailedProduct({
          ...product,
          images: product.thumbnail ? [product.thumbnail] : [],
          options: [],
          variants: [
            {
              id: product.id,
              title: 'Standard',
              price: product.price,
              originalPrice: product.originalPrice,
              discountPercentage: product.discountPercentage,
              inStock: product.inStock !== false,
              options: {},
            },
          ],
        });
      }
    } catch (err) {
      console.error('Error loading Mini PDP details:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const closeMiniPdp = useCallback(() => {
    setIsOpen(false);
    setActiveProduct(null);
    setDetailedProduct(null);
  }, []);

  return (
    <MiniPdpContext.Provider
      value={{
        isOpen,
        activeProduct,
        detailedProduct,
        isLoading,
        openMiniPdp,
        closeMiniPdp,
      }}
    >
      {children}
    </MiniPdpContext.Provider>
  );
};

export function useMiniPdp() {
  const ctx = useContext(MiniPdpContext);
  if (!ctx) {
    throw new Error('useMiniPdp must be used within a MiniPdpProvider');
  }
  return ctx;
}
