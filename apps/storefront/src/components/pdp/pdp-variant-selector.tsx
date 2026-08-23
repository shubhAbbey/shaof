'use client';

import React from 'react';
import type { ProductOption } from '../../lib/commerce';
import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';

export interface PdpVariantSelectorProps {
  options: ProductOption[];
  selectedOptions: Record<string, string>;
  onSelectOption: (optionTitle: string, value: string) => void;
  isOptionValueAvailable: (optionTitle: string, value: string) => boolean;
  doesOptionValueExist: (optionTitle: string, value: string) => boolean;
  isCompact?: boolean;
}

export const PdpVariantSelector: React.FC<PdpVariantSelectorProps> = ({
  options,
  selectedOptions,
  onSelectOption,
  isOptionValueAvailable,
  doesOptionValueExist,
  isCompact = false,
}) => {
  if (!options || options.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex flex-col gap-4', isCompact && 'gap-3')}>
      {options.map((option) => {
        const isColor = option.title.toLowerCase().includes('color') || option.title.toLowerCase().includes('shade');
        const selectedValue = selectedOptions[option.title] || '';

        return (
          <div key={option.id} className="flex flex-col gap-2">
            {/* Option Header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                {option.title}:{' '}
                <span className="font-semibold normal-case text-gray-900 ml-1">
                  {selectedValue || 'Select ' + option.title}
                </span>
              </span>
              {option.title.toLowerCase().includes('size') && !isCompact && (
                <button
                  type="button"
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 underline focus-visible:outline-none"
                >
                  Size Guide
                </button>
              )}
            </div>

            {/* Option Values List */}
            <div className="flex flex-wrap gap-2 items-center">
              {option.values.map((val) => {
                const isSelected = selectedValue === val.value;
                const isAvailable = isOptionValueAvailable(option.title, val.value);
                const exists = doesOptionValueExist(option.title, val.value);

                if (isColor) {
                  return (
                    <button
                      key={val.id}
                      type="button"
                      onClick={() => onSelectOption(option.title, val.value)}
                      disabled={!exists}
                      aria-label={`Select color ${val.value}`}
                      className={cn(
                        'group relative flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all',
                        isSelected
                          ? 'border-brand-600 bg-brand-50 text-brand-900 ring-2 ring-brand-500/20'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50',
                        !isAvailable && 'opacity-60 line-through text-gray-400',
                        !exists && 'opacity-30 cursor-not-allowed'
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3 text-brand-600" />}
                      <span>{val.value}</span>
                    </button>
                  );
                }

                // Standard / Size Button Style
                return (
                  <button
                    key={val.id}
                    type="button"
                    onClick={() => onSelectOption(option.title, val.value)}
                    disabled={!exists}
                    aria-label={`Select size ${val.value}`}
                    className={cn(
                      'min-w-[44px] h-9 px-3 flex items-center justify-center rounded-lg border text-xs font-bold transition-all',
                      isSelected
                        ? 'border-brand-600 bg-brand-600 text-white shadow-xs'
                        : 'border-gray-200 bg-white text-gray-800 hover:border-gray-400 hover:bg-gray-50',
                      !isAvailable && isSelected && 'border-gray-400 bg-gray-500 text-white',
                      !isAvailable && !isSelected && 'border-dashed border-gray-300 text-gray-400 line-through bg-gray-50/50',
                      !exists && 'opacity-30 cursor-not-allowed'
                    )}
                  >
                    {val.value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
PdpVariantSelector.displayName = 'PdpVariantSelector';
