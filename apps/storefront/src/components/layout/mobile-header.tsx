'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, Search, Heart, ShoppingBag, Sparkles } from 'lucide-react';
import { NAVIGATION_CATEGORIES } from '../../data/navigation';
import { useUi } from '../../providers/ui-provider';
import { cn } from '../../lib/utils';

import type { CmsCategoryNavItemDto, CmsGlobalSettingsDto } from '@ecom/types';

export interface MobileHeaderProps {
  navigation?: CmsCategoryNavItemDto[];
  globalSettings?: CmsGlobalSettingsDto | null;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  navigation,
  globalSettings,
}) => {
  const { openMobileNav, openCartDrawer } = useUi();
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number>(0);

  const categories = navigation && navigation.length > 0 ? navigation : (NAVIGATION_CATEGORIES as unknown as CmsCategoryNavItemDto[]);
  const announcementText = globalSettings?.announcementText || 'Free Shipping above ₹999 | COD Available';

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-xs md:hidden">
      {/* 1. Mobile Announcement Strip */}
      <div className="bg-brand-900 text-white text-[11px] py-1 px-3 text-center font-medium">
        <span>{announcementText}</span>
      </div>

      {/* 2. Main Mobile Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        {/* Left: Hamburger Menu & Logo */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={openMobileNav}
            aria-label="Open navigation menu"
            className="p-1 text-gray-700 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
          >
            <Menu className="h-6 w-6" />
          </button>

          <Link href="/" className="flex items-center gap-1.5">
            <div className="h-7 w-7 rounded-md bg-brand-600 flex items-center justify-center text-white text-xs font-black shadow-2xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-lg font-black tracking-tight text-gray-900 leading-none">
              ECOM<span className="text-brand-600">FASHION</span>
            </span>
          </Link>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-3">
          {/* Search Trigger -> dedicated /search page */}
          <Link
            href="/search"
            aria-label="Search catalog"
            className="p-1.5 text-gray-700 hover:text-brand-600"
          >
            <Search className="h-5 w-5" />
          </Link>

          {/* Wishlist */}
          <Link
            href="/wishlist"
            aria-label="View Wishlist"
            className="relative p-1.5 text-gray-700 hover:text-brand-600"
          >
            <Heart className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-brand-600 text-[9px] font-bold text-white flex items-center justify-center">
              0
            </span>
          </Link>

          {/* Cart Bag */}
          <button
            type="button"
            onClick={openCartDrawer}
            aria-label="View Shopping Bag"
            className="relative p-1.5 text-gray-700 hover:text-brand-600"
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-gray-900 text-[9px] font-bold text-white flex items-center justify-center">
              0
            </span>
          </button>
        </div>
      </div>

      {/* 4. Touch-Friendly Horizontal Category Pills */}
      <div className="w-full max-w-full overflow-hidden border-b border-gray-200 bg-white">
        <nav
          aria-label="Category Pills"
          className="no-scrollbar flex w-full max-w-full items-center gap-1.5 overflow-x-auto px-3 py-2 scroll-smooth"
        >
          {categories.map((cat, idx) => {
            const isActive = activeCategoryIndex === idx;
            return (
              <Link
                key={cat.id || cat.handle}
                href={cat.href}
                onClick={() => setActiveCategoryIndex(idx)}
                className={cn(
                  'whitespace-nowrap px-3.5 py-1 rounded-full text-xs font-semibold transition-all shrink-0',
                  isActive
                    ? 'bg-gray-900 text-white shadow-2xs font-bold'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                  cat.handle === 'sale' && !isActive && 'text-red-600 bg-red-50'
                )}
              >
                {cat.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
MobileHeader.displayName = 'MobileHeader';
