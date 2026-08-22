'use client';

import React from 'react';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { formatINR } from '../../lib/utils';
import type { ProductFacets } from '../../lib/commerce';
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';

export interface ActiveFilters {
  brands: string[];
  sizes: string[];
  colors: string[];
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  onSaleOnly?: boolean;
}

export interface PlpFiltersPanelProps {
  facets: ProductFacets;
  activeFilters: ActiveFilters;
  onToggleBrand: (brand: string) => void;
  onToggleSize: (size: string) => void;
  onToggleColor: (color: string) => void;
  onSetPriceRange: (min?: number, max?: number) => void;
  onToggleInStock: (inStock: boolean) => void;
  onToggleOnSale: (onSale: boolean) => void;
  onClearAll: () => void;
}

export const PlpFiltersPanel: React.FC<PlpFiltersPanelProps> = ({
  facets,
  activeFilters,
  onToggleBrand,
  onToggleSize,
  onToggleColor,
  onSetPriceRange,
  onToggleInStock,
  onToggleOnSale,
  onClearAll,
}) => {
  const [openSections, setOpenSections] = React.useState({
    brands: true,
    price: true,
    sizes: true,
    colors: true,
    availability: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const hasActiveFilters =
    activeFilters.brands.length > 0 ||
    activeFilters.sizes.length > 0 ||
    activeFilters.colors.length > 0 ||
    activeFilters.priceMin !== undefined ||
    activeFilters.priceMax !== undefined ||
    activeFilters.inStock ||
    activeFilters.onSaleOnly;

  return (
    <div className="w-full space-y-5 text-sm">
      {/* Clear All Header (if any active filters) */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Active Filters
          </span>
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset All</span>
          </button>
        </div>
      )}

      {/* 1. Brands Accordion */}
      {facets.brands && facets.brands.length > 0 && (
        <div className="border-b border-gray-100 pb-4">
          <button
            type="button"
            onClick={() => toggleSection('brands')}
            className="flex w-full items-center justify-between py-1 text-left font-bold text-gray-900 focus-visible:outline-none"
          >
            <span>Brand ({facets.brands.length})</span>
            {openSections.brands ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </button>

          {openSections.brands && (
            <div className="mt-3 space-y-2.5 max-h-52 overflow-y-auto pr-1">
              {facets.brands.map((b) => {
                const isChecked = activeFilters.brands.some(
                  (ab) => ab.toLowerCase() === b.value.toLowerCase()
                );
                return (
                  <label
                    key={b.value}
                    className="flex items-center justify-between cursor-pointer group select-none text-xs text-gray-700 hover:text-gray-900"
                  >
                    <div className="flex items-center gap-2.5">
                      <Checkbox
                        checked={isChecked}
                        onChange={() => onToggleBrand(b.value)}
                      />
                      <span className={isChecked ? 'font-bold text-brand-700' : ''}>
                        {b.label}
                      </span>
                    </div>
                    {b.count !== undefined && (
                      <span className="text-[11px] text-gray-400 font-mono">({b.count})</span>
                    )}
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. Price Range Accordion */}
      <div className="border-b border-gray-100 pb-4">
        <button
          type="button"
          onClick={() => toggleSection('price')}
          className="flex w-full items-center justify-between py-1 text-left font-bold text-gray-900 focus-visible:outline-none"
        >
          <span>Price (INR)</span>
          {openSections.price ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </button>

        {openSections.price && (
          <div className="mt-3 space-y-3">
            {/* Quick Price Range Presets */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Under ₹1,500', min: undefined, max: 1500 },
                { label: '₹1,500 - ₹3,000', min: 1500, max: 3000 },
                { label: 'Above ₹3,000', min: 3000, max: undefined },
              ].map((p) => {
                const isSelected =
                  activeFilters.priceMin === p.min && activeFilters.priceMax === p.max;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        onSetPriceRange(undefined, undefined);
                      } else {
                        onSetPriceRange(p.min, p.max);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-brand-50 border-brand-500 text-brand-700 font-bold'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* Custom Min / Max Inputs */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="number"
                placeholder="Min"
                value={activeFilters.priceMin ?? ''}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : undefined;
                  onSetPriceRange(val, activeFilters.priceMax);
                }}
                className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-900 focus:border-brand-500 focus:outline-none"
              />
              <span className="text-gray-400 text-xs">-</span>
              <input
                type="number"
                placeholder="Max"
                value={activeFilters.priceMax ?? ''}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : undefined;
                  onSetPriceRange(activeFilters.priceMin, val);
                }}
                className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-900 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Sizes Accordion */}
      {facets.sizes && facets.sizes.length > 0 && (
        <div className="border-b border-gray-100 pb-4">
          <button
            type="button"
            onClick={() => toggleSection('sizes')}
            className="flex w-full items-center justify-between py-1 text-left font-bold text-gray-900 focus-visible:outline-none"
          >
            <span>Size</span>
            {openSections.sizes ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </button>

          {openSections.sizes && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {facets.sizes.map((s) => {
                const isSelected = activeFilters.sizes.some(
                  (as) => as.toLowerCase() === s.value.toLowerCase()
                );
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => onToggleSize(s.value)}
                    className={`min-w-[38px] px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all text-center ${
                      isSelected
                        ? 'bg-brand-600 border-brand-600 text-white shadow-xs'
                        : 'bg-white border-gray-200 text-gray-800 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. Colors Accordion */}
      {facets.colors && facets.colors.length > 0 && (
        <div className="border-b border-gray-100 pb-4">
          <button
            type="button"
            onClick={() => toggleSection('colors')}
            className="flex w-full items-center justify-between py-1 text-left font-bold text-gray-900 focus-visible:outline-none"
          >
            <span>Color ({facets.colors.length})</span>
            {openSections.colors ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </button>

          {openSections.colors && (
            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
              {facets.colors.map((c) => {
                const isChecked = activeFilters.colors.some(
                  (ac) => ac.toLowerCase() === c.value.toLowerCase()
                );
                return (
                  <label
                    key={c.value}
                    className="flex items-center justify-between cursor-pointer group select-none text-xs text-gray-700 hover:text-gray-900"
                  >
                    <div className="flex items-center gap-2.5">
                      <Checkbox
                        checked={isChecked}
                        onChange={() => onToggleColor(c.value)}
                      />
                      <span className={isChecked ? 'font-bold text-brand-700' : ''}>
                        {c.label}
                      </span>
                    </div>
                    {c.count !== undefined && (
                      <span className="text-[11px] text-gray-400 font-mono">({c.count})</span>
                    )}
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. Availability & Discount Toggles */}
      <div className="space-y-3 pt-1">
        <label className="flex items-center justify-between cursor-pointer group select-none text-xs text-gray-800">
          <span className="font-semibold">In Stock Only</span>
          <input
            type="checkbox"
            checked={Boolean(activeFilters.inStock)}
            onChange={(e) => onToggleInStock(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer group select-none text-xs text-gray-800">
          <span className="font-semibold">Special Offers & Sale</span>
          <input
            type="checkbox"
            checked={Boolean(activeFilters.onSaleOnly)}
            onChange={(e) => onToggleOnSale(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
};
PlpFiltersPanel.displayName = 'PlpFiltersPanel';
