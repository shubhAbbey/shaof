'use client';

import React from 'react';
import Link from 'next/link';
import type { NavCategory } from '../../types/navigation';
import { Badge } from '../ui/badge';
import { ArrowRight, Sparkles, Flame } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface MegaMenuProps {
  category: NavCategory;
  isOpen: boolean;
  onClose: () => void;
  arrowOffset?: number;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({
  category,
  isOpen,
  onClose,
  arrowOffset = 100,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="absolute left-0 right-0 top-full z-40 w-full animate-fadeIn shadow-2xl transition-all"
      role="region"
      aria-label={`${category.name} Mega Menu`}
      onMouseLeave={onClose}
    >
      {/* Visual Arrow Indicator */}
      {/* <div
        className="absolute -top-2 h-4 w-4 rotate-45 border-l border-t border-gray-200 bg-white transition-all"
        style={{ left: `${arrowOffset}px` }}
        aria-hidden="true"
      /> */}

      {/* Main Mega Menu Card */}
      <div className="border-b border-gray-200 bg-white backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="grid grid-cols-12 gap-8">
            {/* Subcategory Columns (Cols 1-8 / 9) */}
            <div
              className={cn(
                'grid gap-6',
                category.featured && category.featured.length > 0
                  ? 'col-span-8 grid-cols-3'
                  : 'col-span-12 grid-cols-4'
              )}
            >
              {category.groups.map((group) => (
                <div key={group.title} className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2">
                    {group.title}
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {group.items.map((item) => (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className="group flex items-center justify-between text-gray-600 hover:text-brand-600 transition-colors py-0.5"
                        >
                          <span className="group-hover:translate-x-0.5 transition-transform">
                            {item.label}
                          </span>
                          {item.isHot && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                              <Flame className="h-2.5 w-2.5" />
                              HOT
                            </span>
                          )}
                          {item.isNew && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">
                              <Sparkles className="h-2.5 w-2.5" />
                              NEW
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Featured Promotional Banners (Cols 9-12) */}
            {category.featured && category.featured.length > 0 && (
              <div className="col-span-4 border-l border-gray-100 pl-8 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2">
                  Featured Highlights
                </h4>
                <div className="space-y-4">
                  {category.featured.map((feat) => (
                    <Link
                      key={feat.title}
                      href={feat.href}
                      onClick={onClose}
                      className="group block overflow-hidden rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition-all hover:border-brand-300 hover:bg-brand-50/30 hover:shadow-sm"
                    >
                      {feat.badge && (
                        <Badge variant="brand" size="sm" className="mb-2">
                          {feat.badge}
                        </Badge>
                      )}
                      <h5 className="text-sm font-bold text-gray-900 group-hover:text-brand-600 transition-colors">
                        {feat.title}
                      </h5>
                      {feat.subtitle && (
                        <p className="mt-1 text-xs text-gray-500 line-clamp-2">{feat.subtitle}</p>
                      )}
                      <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-brand-600 group-hover:gap-1.5 transition-all">
                        <span>Explore Collection</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Bar: View All Category Products */}
          <div className="mt-6 border-t border-gray-100 pt-4 flex items-center justify-between text-xs text-gray-500">
            <span>Explore all items in {category.name}</span>
            <Link
              href={category.href}
              onClick={onClose}
              className="font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              View All {category.name} Catalog
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
MegaMenu.displayName = 'MegaMenu';
