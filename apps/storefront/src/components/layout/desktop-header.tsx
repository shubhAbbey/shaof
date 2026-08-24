'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { User, Heart, ShoppingBag, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Container } from '../ui/container';
import { Badge } from '../ui/badge';
import { SearchBar } from './search-bar';
import { MegaMenu } from './mega-menu';
import { NAVIGATION_CATEGORIES } from '../../data/navigation';
import { useUi } from '../../providers/ui-provider';
import { cn } from '../../lib/utils';

import type { CmsCategoryNavItemDto, CmsGlobalSettingsDto } from '@ecom/types';

export interface DesktopHeaderProps {
  navigation?: CmsCategoryNavItemDto[];
  globalSettings?: CmsGlobalSettingsDto | null;
}

export const DesktopHeader: React.FC<DesktopHeaderProps> = ({
  navigation,
  globalSettings,
}) => {
  const { openCartDrawer } = useUi();
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(null);
  const [arrowOffset, setArrowOffset] = useState<number>(100);
  const navContainerRef = useRef<HTMLDivElement>(null);
  const categoryTabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const categories = navigation && navigation.length > 0 ? navigation : (NAVIGATION_CATEGORIES as unknown as CmsCategoryNavItemDto[]);
  const announcementText = globalSettings?.announcementText || 'Free Express Shipping across India on orders above ₹999 | Cash on Delivery Available';
  const siteTagline = globalSettings?.siteTagline || 'India Modern Edit';
  const siteName = globalSettings?.siteName || 'EcomFashion';

  const handleCategoryHover = (index: number) => {
    setActiveCategoryIndex(index);
    const tabEl = categoryTabRefs.current[index];
    const navEl = navContainerRef.current;
    if (tabEl && navEl) {
      const tabRect = tabEl.getBoundingClientRect();
      const navRect = navEl.getBoundingClientRect();
      setArrowOffset(tabRect.left - navRect.left + tabRect.width / 2);
    }
  };

  const handleScrollNav = (direction: 'left' | 'right') => {
    if (navContainerRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      navContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 hidden w-full bg-white shadow-xs md:block">
      {/* 1. Announcement Strip */}
      <div className="bg-brand-900 text-white text-xs py-1.5 px-4">
        <Container size="xl" className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-brand-600 text-white font-bold px-2 py-0.5 rounded text-[10px] tracking-wider uppercase">
              Limited Offer
            </span>
            <span>{announcementText}</span>
          </div>
          <div className="flex items-center gap-4 text-brand-100">
            <Link href="/account/orders" className="hover:text-white transition-colors">
              Track Order
            </Link>
            <span>|</span>
            <Link href="/pages/help-center" className="hover:text-white transition-colors">
              Customer Support
            </Link>
          </div>
        </Container>
      </div>

      {/* 2. Main Brand & Search Bar */}
      <div className="border-b border-gray-100 py-3.5">
        <Container size="xl" className="flex items-center justify-between gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="h-9 w-9 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-xs group-hover:bg-brand-700 transition-colors">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-gray-900 leading-none">
                {siteName.slice(0, 4)}<span className="text-brand-600">{siteName.slice(4)}</span>
              </span>
              <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">
                {siteTagline}
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <div className="flex-1 max-w-2xl">
            <SearchBar />
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-6 shrink-0">
            {/* Account */}
            <Link
              href="/account"
              className="flex flex-col items-center text-gray-700 hover:text-brand-600 transition-colors group"
            >
              <User className="h-5 w-5 group-hover:scale-105 transition-transform" />
              <span className="text-[11px] font-medium mt-0.5">Account</span>
            </Link>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="flex flex-col items-center text-gray-700 hover:text-brand-600 transition-colors group relative"
            >
              <div className="relative">
                <Heart className="h-5 w-5 group-hover:scale-105 transition-transform" />
                <span className="absolute -top-1.5 -right-2 h-4 w-4 rounded-full bg-brand-600 text-[10px] font-bold text-white flex items-center justify-center">
                  0
                </span>
              </div>
              <span className="text-[11px] font-medium mt-0.5">Wishlist</span>
            </Link>

            {/* Cart / Bag Button */}
            <button
              type="button"
              onClick={openCartDrawer}
              aria-label="Open Shopping Bag"
              className="flex flex-col items-center text-gray-700 hover:text-brand-600 transition-colors group relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded p-0.5"
            >
              <div className="relative">
                <ShoppingBag className="h-5 w-5 group-hover:scale-105 transition-transform" />
                <span className="absolute -top-1.5 -right-2 h-4 w-4 rounded-full bg-gray-900 text-[10px] font-bold text-white flex items-center justify-center">
                  0
                </span>
              </div>
              <span className="text-[11px] font-medium mt-0.5">Bag</span>
            </button>
          </div>
        </Container>
      </div>

      {/* 3. Horizontal Category Navigation Bar */}
      <div className="relative border-b border-gray-200 bg-white">
        <Container size="xl" className="relative flex items-center justify-between">
          {/* Scroll Left Button */}
          <button
            type="button"
            onClick={() => handleScrollNav('left')}
            aria-label="Scroll categories left"
            className="absolute left-1 z-10 hidden rounded-full bg-white/90 p-1 text-gray-400 shadow-md hover:text-gray-700 md:flex"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Categories List */}
          <nav
            ref={navContainerRef}
            aria-label="Primary Categories"
            className="no-scrollbar flex w-full items-center gap-1 overflow-x-auto py-1 scroll-smooth"
          >
            {categories.map((cat, idx) => {
              const isActive = activeCategoryIndex === idx;
              return (
                <button
                  key={cat.id || cat.handle}
                  ref={(el) => {
                    categoryTabRefs.current[idx] = el;
                  }}
                  type="button"
                  onMouseEnter={() => handleCategoryHover(idx)}
                  onClick={() => handleCategoryHover(idx)}
                  aria-expanded={isActive}
                  className={cn(
                    'group relative inline-flex items-center gap-1.5 whitespace-nowrap px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-md',
                    isActive ? 'text-brand-600' : 'text-gray-700 hover:text-gray-950',
                    cat.handle === 'sale' && 'text-red-600 hover:text-red-700 font-bold'
                  )}
                >
                  <span>{cat.name}</span>
                  {cat.badge && (
                    <Badge
                      variant={cat.handle === 'sale' ? 'danger' : 'brand'}
                      size="sm"
                      className="text-[9px] px-1.5 py-0"
                    >
                      {cat.badge}
                    </Badge>
                  )}
                  {/* Active bottom border indicator */}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand-600 rounded-full"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Scroll Right Button */}
          <button
            type="button"
            onClick={() => handleScrollNav('right')}
            aria-label="Scroll categories right"
            className="absolute right-1 z-10 hidden rounded-full bg-white/90 p-1 text-gray-400 shadow-md hover:text-gray-700 md:flex"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </Container>

        {/* Mega Menu Dropdown */}
        {activeCategoryIndex !== null && categories[activeCategoryIndex] && (
          <MegaMenu
            category={categories[activeCategoryIndex]}
            isOpen={activeCategoryIndex !== null}
            onClose={() => setActiveCategoryIndex(null)}
            arrowOffset={arrowOffset}
          />
        )}
      </div>
    </header>
  );
};
DesktopHeader.displayName = 'DesktopHeader';
