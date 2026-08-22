'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  User,
  Heart,
  Package,
  Headphones,
  ChevronRight,
  Sparkles,
  Flame,
  ChevronDown,
} from 'lucide-react';
import { Drawer } from '../ui/drawer';
import { Badge } from '../ui/badge';
import { NAVIGATION_CATEGORIES } from '../../data/navigation';
import { useUi } from '../../providers/ui-provider';
import { cn } from '../../lib/utils';

export const MobileNavDrawer: React.FC = () => {
  const { isMobileNavOpen, closeMobileNav } = useUi();
  const [selectedCatId, setSelectedCatId] = useState<string>('women');
  const [openGroupTitle, setOpenGroupTitle] = useState<string | null>(null);

  const selectedCategory =
    NAVIGATION_CATEGORIES.find((c) => c.id === selectedCatId) || NAVIGATION_CATEGORIES[0];

  const toggleGroup = (title: string) => {
    setOpenGroupTitle((prev) => (prev === title ? null : title));
  };

  return (
    <Drawer
      isOpen={isMobileNavOpen}
      onClose={closeMobileNav}
      position="left"
      size="md"
      showCloseButton
      title={
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-brand-600 flex items-center justify-center text-white text-xs font-black">
            EF
          </div>
          <span className="text-base font-black text-gray-900">
            ECOM<span className="text-brand-600">FASHION</span>
          </span>
        </div>
      }
      footer={
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <Link
            href="/help"
            onClick={closeMobileNav}
            className="flex items-center gap-2 rounded-lg bg-white p-2.5 border border-gray-200"
          >
            <Headphones className="h-4 w-4 text-brand-600" />
            <span>24/7 Help</span>
          </Link>
          <div className="flex items-center gap-2 rounded-lg bg-white p-2.5 border border-gray-200">
            <span className="font-bold text-gray-800">INR (₹)</span>
            <span>India</span>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* 1. Account / Login Banner */}
        <Link
          href="/account"
          onClick={closeMobileNav}
          className="flex items-center justify-between rounded-xl bg-brand-50 p-4 border border-brand-100"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-brand-600 text-white flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Sign In / Register</p>
              <p className="text-xs text-brand-700">Quick OTP login & saved bag</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-brand-600" />
        </Link>

        {/* 2. Top-Level Category Switcher Pills */}
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-100">
          {NAVIGATION_CATEGORIES.map((cat) => {
            const isSelected = cat.id === selectedCatId;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCatId(cat.id);
                  setOpenGroupTitle(null);
                }}
                className={cn(
                  'whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0',
                  isSelected
                    ? 'bg-gray-900 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* 3. Subcategories Accordion List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              {selectedCategory.name} Categories
            </h4>
            <Link
              href={selectedCategory.href}
              onClick={closeMobileNav}
              className="text-xs font-bold text-brand-600 hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="divide-y divide-gray-100 border-y border-gray-100">
            {selectedCategory.groups.map((group) => {
              const isExpanded = openGroupTitle === group.title;
              return (
                <div key={group.title} className="py-2">
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.title)}
                    className="flex w-full items-center justify-between py-1.5 text-sm font-semibold text-gray-800 text-left"
                  >
                    <span>{group.title}</span>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 text-gray-400 transition-transform duration-200',
                        isExpanded && 'rotate-180 text-brand-600'
                      )}
                    />
                  </button>

                  {isExpanded && (
                    <ul className="mt-2 space-y-2 pl-3 pt-1 border-l-2 border-brand-200">
                      {group.items.map((item) => (
                        <li key={item.label}>
                          <Link
                            href={item.href}
                            onClick={closeMobileNav}
                            className="flex items-center justify-between text-xs text-gray-600 hover:text-brand-600 py-1"
                          >
                            <span>{item.label}</span>
                            {item.isHot && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-red-600 bg-red-50 px-1 py-0.5 rounded">
                                <Flame className="h-2 w-2" />
                                HOT
                              </span>
                            )}
                            {item.isNew && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-brand-600 bg-brand-50 px-1 py-0.5 rounded">
                                <Sparkles className="h-2 w-2" />
                                NEW
                              </span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Quick Account Actions */}
        <div className="space-y-1 pt-2 border-t border-gray-100">
          <Link
            href="/account/orders"
            onClick={closeMobileNav}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Package className="h-4 w-4 text-gray-500" />
            <span>My Orders & Returns</span>
          </Link>
          <Link
            href="/wishlist"
            onClick={closeMobileNav}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Heart className="h-4 w-4 text-gray-500" />
            <span>Saved Wishlist</span>
          </Link>
        </div>
      </div>
    </Drawer>
  );
};
MobileNavDrawer.displayName = 'MobileNavDrawer';
