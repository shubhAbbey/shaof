'use client';

import React from 'react';
import { cn } from '../../lib/utils';

export type AteevraLoaderSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AteevraLoaderVariant = 'customer' | 'admin' | 'merchant' | 'white' | 'neutral';

export interface AteevraLoaderProps {
  size?: AteevraLoaderSize;
  variant?: AteevraLoaderVariant;
  text?: string;
  subtext?: string;
  fullScreen?: boolean;
  className?: string;
  fadePulse?: boolean;
}

const SIZE_MAP: Record<AteevraLoaderSize, { container: string; spinner: string; stroke: number; text: string }> = {
  xs: { container: 'h-4 w-4', spinner: 'h-4 w-4', stroke: 8, text: 'text-[10px]' },
  sm: { container: 'h-6 w-6', spinner: 'h-6 w-6', stroke: 7, text: 'text-xs' },
  md: { container: 'h-11 w-11', spinner: 'h-11 w-11', stroke: 5.5, text: 'text-sm' },
  lg: { container: 'h-16 w-16', spinner: 'h-16 w-16', stroke: 4.5, text: 'text-base' },
  xl: { container: 'h-24 w-24', spinner: 'h-24 w-24', stroke: 3.8, text: 'text-lg' },
};

const VARIANT_MAP: Record<AteevraLoaderVariant, { ringColor: string; textColor: string; markSrc: string }> = {
  customer: {
    ringColor: 'text-[#960e29]',
    textColor: 'text-[#960e29]',
    markSrc: '/images/ateevra-a-mark.png',
  },
  admin: {
    ringColor: 'text-red-500',
    textColor: 'text-red-500',
    markSrc: '/images/ateevra-a-mark.png',
  },
  merchant: {
    ringColor: 'text-orange-500',
    textColor: 'text-orange-500',
    markSrc: '/images/ateevra-a-mark.png',
  },
  white: {
    ringColor: 'text-white',
    textColor: 'text-white',
    markSrc: '/images/ateevra-a-mark-white.png',
  },
  neutral: {
    ringColor: 'text-slate-600',
    textColor: 'text-slate-700',
    markSrc: '/images/ateevra-a-mark.png',
  },
};

export const AteevraLoader: React.FC<AteevraLoaderProps> = ({
  size = 'md',
  variant = 'customer',
  text,
  subtext,
  fullScreen = false,
  className,
  fadePulse = true,
}) => {
  const { container, stroke, text: textSize } = SIZE_MAP[size];
  const { ringColor, textColor, markSrc } = VARIANT_MAP[variant];

  const loaderSpinner = (
    <div
      className={cn('relative inline-flex items-center justify-center shrink-0', container, ringColor, className)}
      role="status"
      aria-label="Loading"
    >
      {/* Outer Rotating Circular Track and Animated Arc */}
      <svg
        className="w-full h-full animate-spin"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ animationDuration: '1.25s' }}
      >
        {/* Static Background Track Circle */}
        <circle
          cx="50"
          cy="50"
          r="42"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeOpacity="0.16"
        />
        {/* Animated Revolving Arc */}
        <circle
          cx="50"
          cy="50"
          r="42"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray="65 190"
        />
      </svg>

      {/* Center 'A' Brand Emblem with Smooth Fade-In Fade-Out Breathing Animation */}
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center pointer-events-none select-none',
          fadePulse && 'animate-pulse'
        )}
        style={{ animationDuration: '1.8s' }}
      >
        <img
          src={markSrc}
          alt="Ateevra Brand Mark"
          className="w-[58%] h-[58%] object-contain drop-shadow-xs"
        />
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm p-4 transition-all duration-300"
        role="alert"
        aria-busy="true"
      >
        <div className="flex flex-col items-center justify-center gap-4 text-center max-w-sm">
          {loaderSpinner}
          {text && (
            <div className="space-y-1 animate-fade-in">
              <p className={cn('font-bold tracking-tight', textSize, textColor)}>{text}</p>
              {subtext && <p className="text-xs text-slate-500 font-medium">{subtext}</p>}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (text) {
    return (
      <div className={cn('inline-flex flex-col items-center justify-center gap-2.5', className)}>
        {loaderSpinner}
        <div className="text-center">
          <p className={cn('font-semibold tracking-tight', textSize, textColor)}>{text}</p>
          {subtext && <p className="text-[11px] text-slate-400 font-medium">{subtext}</p>}
        </div>
      </div>
    );
  }

  return loaderSpinner;
};

export default AteevraLoader;
