'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface HorizontalItemScrollerProps {
  children: React.ReactNode;
  desktopVisibleItems?: number; // default: 4 or 5
  mobileVisibleItems?: number; // default: 2
  sliderEnabled?: boolean; // default: true
  className?: string;
}

export const HorizontalItemScroller: React.FC<HorizontalItemScrollerProps> = ({
  children,
  desktopVisibleItems = 5,
  mobileVisibleItems = 2,
  sliderEnabled = true,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = containerRef.current;
    if (el) {
      const hasOverflow = el.scrollWidth > el.clientWidth + 2;
      setCanScrollLeft(el.scrollLeft > 5);
      setCanScrollRight(hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [children]);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = containerRef.current;
    if (el) {
      const scrollDistance = el.clientWidth * 0.75;
      el.scrollBy({
        left: direction === 'left' ? -scrollDistance : scrollDistance,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <div className="group relative w-full">
      {/* Desktop Left Scroll Button */}
      {sliderEnabled && canScrollLeft && (
        <button
          type="button"
          onClick={() => handleScroll('left')}
          aria-label="Scroll left"
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 hidden md:flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-gray-700 shadow-md border border-gray-100 hover:bg-brand-50 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 transition-all"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      {/* Horizontal Scroll Track */}
      <div
        ref={containerRef}
        onScroll={checkScroll}
        className={cn(
          'no-scrollbar -mx-4 flex gap-3 sm:gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0 scroll-smooth snap-x snap-mandatory',
          className
        )}
      >
        {children}
      </div>

      {/* Desktop Right Scroll Button */}
      {sliderEnabled && canScrollRight && (
        <button
          type="button"
          onClick={() => handleScroll('right')}
          aria-label="Scroll right"
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 hidden md:flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-gray-700 shadow-md border border-gray-100 hover:bg-brand-50 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 transition-all"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};
HorizontalItemScroller.displayName = 'HorizontalItemScroller';
