'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useMobileBack, UseMobileBackOptions } from '../../hooks/use-mobile-back';
import { cn } from '../../lib/utils';

export interface MobileBackButtonProps extends UseMobileBackOptions {
  className?: string;
  label?: string;
  showLabel?: boolean;
}

export const MobileBackButton: React.FC<MobileBackButtonProps> = ({
  fallbackUrl = '/',
  onBeforeBack,
  className,
  label = 'Back',
  showLabel = true,
}) => {
  const { handleBack } = useMobileBack({ fallbackUrl, onBeforeBack });

  return (
    <button
      type="button"
      onClick={handleBack}
      data-testid="mobile-back-btn"
      aria-label="Go back to previous page"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg py-1.5 px-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
        className
      )}
    >
      <ArrowLeft className="h-4 w-4 shrink-0 text-gray-600" />
      {showLabel && <span>{label}</span>}
    </button>
  );
};
MobileBackButton.displayName = 'MobileBackButton';
