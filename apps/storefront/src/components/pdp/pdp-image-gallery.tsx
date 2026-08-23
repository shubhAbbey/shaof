'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  ArrowLeft,
  X,
  Maximize2,
  Check,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface PdpImageGalleryColorOption {
  title: string;
  values: string[];
  selectedValue?: string;
  onSelectColor: (color: string) => void;
}

export interface PdpImageGalleryProps {
  images: string[];
  title: string;
  activeImageIndex: number;
  onSelectImage: (index: number) => void;
  isCompact?: boolean;
  colorOption?: PdpImageGalleryColorOption;
}

const COLOR_MAP: Record<string, string> = {
  'royal magenta': '#c026d3',
  'emerald green': '#059669',
  'sage green': '#84a98c',
  'pure white': '#ffffff',
  'white': '#ffffff',
  'black': '#18181b',
  'indigo': '#4338ca',
  'mustard yellow': '#eab308',
  'mustard': '#eab308',
  'yellow': '#facc15',
  'pastel pink': '#fbcfe8',
  'pink': '#ec4899',
  'floral white': '#fafaf9',
  'deep ruby': '#991b1b',
  'ruby': '#be123c',
  'gold': '#d97706',
  'navy blue': '#1e3a8a',
  'navy': '#1e3a8a',
  'blue': '#2563eb',
  'red': '#dc2626',
  'green': '#16a34a',
  'grey': '#71717a',
  'gray': '#71717a',
  'beige': '#d4b996',
  'olive': '#556b2f',
  'maroon': '#800000',
  'coral': '#f87171',
  'teal': '#0d9488',
  'brown': '#78350f',
  'orange': '#ea580c',
  'purple': '#9333ea',
};

function getColorHex(colorName: string): string {
  const normalized = colorName.trim().toLowerCase();
  return COLOR_MAP[normalized] || '#9ca3af';
}

export const PdpImageGallery: React.FC<PdpImageGalleryProps> = ({
  images,
  title,
  activeImageIndex,
  onSelectImage,
  isCompact = false,
  colorOption,
}) => {
  // Desktop Zoom States (Preserved Behavior)
  const [isDesktopZoomed, setIsDesktopZoomed] = useState(false);
  const [desktopZoomScale, setDesktopZoomScale] = useState(2);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const mainImageRef = useRef<HTMLDivElement>(null);

  // Dedicated Mobile Full-Image Viewer States
  const [isMobileViewerOpen, setIsMobileViewerOpen] = useState(false);
  const [mobileZoomScale, setMobileZoomScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const safeImages =
    images && images.length > 0
      ? images
      : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'];

  const currentImage = safeImages[activeImageIndex] || safeImages[0];

  const handleCloseMobileViewer = useCallback(() => {
    setIsMobileViewerOpen(false);
    setMobileZoomScale(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Lock background scrolling when mobile full viewer is open
  useEffect(() => {
    if (isMobileViewerOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isMobileViewerOpen]);

  // Handle ESC key to close viewer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileViewerOpen) {
        handleCloseMobileViewer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileViewerOpen, handleCloseMobileViewer]);

  // Desktop Mouse Move Handler
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainImageRef.current) return;
    const { left, top, width, height } = mainImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  }, []);

  const handleNextImage = useCallback(
    (e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      onSelectImage((activeImageIndex + 1) % safeImages.length);
      setPan({ x: 0, y: 0 });
    },
    [activeImageIndex, safeImages.length, onSelectImage]
  );

  const handlePrevImage = useCallback(
    (e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      onSelectImage((activeImageIndex - 1 + safeImages.length) % safeImages.length);
      setPan({ x: 0, y: 0 });
    },
    [activeImageIndex, safeImages.length, onSelectImage]
  );

  // Mobile Image Tap: Open Dedicated Full Viewer
  const handleMainImageClick = useCallback(() => {
    // Only open mobile full-screen viewer on mobile viewports (< 768px)
    if (typeof window !== 'undefined') {
      const isMobile =
        window.innerWidth < 768 ||
        (typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 767px)').matches);
      if (isMobile) {
        setIsMobileViewerOpen(true);
        setMobileZoomScale(1);
        setPan({ x: 0, y: 0 });
      }
    }
  }, []);

  // Mobile Zoom In/Out/Reset
  const handleMobileZoomIn = useCallback(() => {
    setMobileZoomScale((s) => Math.min(3.5, Number((s + 0.5).toFixed(1))));
  }, []);

  const handleMobileZoomOut = useCallback(() => {
    setMobileZoomScale((s) => {
      const next = Math.max(1, Number((s - 0.5).toFixed(1)));
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const handleMobileResetZoom = useCallback(() => {
    setMobileZoomScale(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Double tap to toggle zoom
  const handleDoubleTap = useCallback(() => {
    setMobileZoomScale((prev) => {
      if (prev > 1) {
        setPan({ x: 0, y: 0 });
        return 1;
      }
      return 2;
    });
  }, []);

  // Mobile Pan / Drag Handlers
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (mobileZoomScale <= 1) return;
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        panX: pan.x,
        panY: pan.y,
      };
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [mobileZoomScale, pan]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || mobileZoomScale <= 1) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;

      const maxPanX = (window.innerWidth * (mobileZoomScale - 1)) / 2;
      const maxPanY = (window.innerHeight * 0.7 * (mobileZoomScale - 1)) / 2;

      const nextX = Math.max(-maxPanX, Math.min(maxPanX, dragStartRef.current.panX + dx));
      const nextY = Math.max(-maxPanY, Math.min(maxPanY, dragStartRef.current.panY + dy));

      setPan({ x: nextX, y: nextY });
    },
    [isDragging, mobileZoomScale]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (isDragging) {
        setIsDragging(false);
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      }
    },
    [isDragging]
  );

  // Touch Swipe on 1x Zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || mobileZoomScale > 1) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.time;

    // Detect horizontal swipe
    if (Math.abs(dx) > 45 && Math.abs(dy) < 60 && dt < 400) {
      if (dx < 0) {
        handleNextImage();
      } else {
        handlePrevImage();
      }
    }
    touchStartRef.current = null;
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* 1. Main Image Container (Desktop: Hover Zoom | Mobile: Tap opens full viewer) */}
      <div
        ref={mainImageRef}
        data-testid="pdp-main-image"
        role="button"
        tabIndex={0}
        aria-label="Enlarge product image"
        onClick={handleMainImageClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleMainImageClick();
          }
        }}
        onMouseMove={isDesktopZoomed ? handleMouseMove : undefined}
        onMouseEnter={() => {
          if (typeof window !== 'undefined' && window.innerWidth >= 768 && !isCompact) {
            setIsDesktopZoomed(true);
          }
        }}
        onMouseLeave={() => setIsDesktopZoomed(false)}
        className={cn(
          'relative w-full overflow-hidden rounded-2xl bg-gray-50 border border-gray-100 select-none group cursor-pointer md:cursor-default focus-visible:ring-2 focus-visible:ring-brand-500',
          isCompact ? 'aspect-[4/5] sm:aspect-[3/4]' : 'aspect-[3/4]'
        )}
      >
        {/* Base Image */}
        <div
          className={cn(
            'relative h-full w-full transition-transform duration-200 ease-out',
            isDesktopZoomed && 'md:cursor-crosshair'
          )}
          style={
            isDesktopZoomed
              ? {
                  transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                  transform: `scale(${desktopZoomScale})`,
                }
              : undefined
          }
        >
          {currentImage ? (
            <Image
              src={currentImage}
              alt={`${title} - View ${activeImageIndex + 1}`}
              fill
              priority
              sizes={isCompact ? '(max-width: 768px) 100vw, 400px' : '(max-width: 1024px) 100vw, 600px'}
              className="object-cover object-center"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-300">
              <ShoppingBag className="h-16 w-16" />
            </div>
          )}
        </div>

        {/* Mobile Tap-to-Zoom Indicator Pill */}
        <div className="md:hidden absolute bottom-3 left-3 z-10 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 text-white backdrop-blur-xs text-[10px] font-medium pointer-events-none">
          <Maximize2 className="h-3 w-3" />
          <span>Tap to zoom</span>
        </div>

        {/* Desktop Zoom Controls Overlay */}
        {!isCompact && (
          <div className="hidden md:flex absolute right-3 top-3 z-10 items-center gap-1.5 rounded-lg bg-white/90 p-1 shadow-sm backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDesktopZoomScale((s) => Math.min(3, s + 0.5));
                setIsDesktopZoomed(true);
              }}
              aria-label="Zoom in"
              className="p-1.5 text-gray-600 hover:text-brand-600 rounded hover:bg-gray-100 focus-visible:outline-none"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDesktopZoomScale((s) => Math.max(1.2, s - 0.5));
                setIsDesktopZoomed(true);
              }}
              aria-label="Zoom out"
              className="p-1.5 text-gray-600 hover:text-brand-600 rounded hover:bg-gray-100 focus-visible:outline-none"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsDesktopZoomed(false);
                setDesktopZoomScale(2);
              }}
              aria-label="Reset zoom"
              className="p-1.5 text-gray-600 hover:text-brand-600 rounded hover:bg-gray-100 focus-visible:outline-none"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Navigation Arrows & Counter */}
        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevImage}
              aria-label="Previous image"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md backdrop-blur-xs transition-opacity hover:bg-white focus-visible:outline-none"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleNextImage}
              aria-label="Next image"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md backdrop-blur-xs transition-opacity hover:bg-white focus-visible:outline-none"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Counter Badge */}
            <div className="absolute bottom-3 right-3 z-10 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-xs">
              {activeImageIndex + 1} / {safeImages.length}
            </div>
          </>
        )}
      </div>

      {/* 2. Thumbnails Row (Desktop / Normal PDP) */}
      {safeImages.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {safeImages.map((imgUrl, idx) => {
            const isSelected = idx === activeImageIndex;
            return (
              <button
                key={imgUrl + idx}
                type="button"
                data-testid={`pdp-thumbnail-${idx}`}
                onClick={() => onSelectImage(idx)}
                aria-label={`Select thumbnail ${idx + 1}`}
                className={cn(
                  'relative flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all',
                  isCompact ? 'h-14 w-14' : 'h-16 w-16 sm:h-20 sm:w-20',
                  isSelected
                    ? 'border-brand-600 ring-2 ring-brand-500/20 opacity-100 shadow-xs'
                    : 'border-transparent opacity-60 hover:opacity-100 hover:border-gray-200'
                )}
              >
                <Image
                  src={imgUrl}
                  alt={`${title} thumb ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover object-center"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* 3. DEDICATED FULL-IMAGE VIEWER (MOBILE ONLY) */}
      {isMobileViewerOpen && (
        <div
          data-testid="mobile-image-viewer-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Full screen image viewer"
          className="fixed inset-0 z-[100] bg-neutral-950 flex flex-col select-none touch-none text-white animate-in fade-in duration-200"
        >
          {/* Header Bar */}
          <div className="relative z-20 flex items-center justify-between px-4 py-3 bg-neutral-900/80 backdrop-blur-md border-b border-white/10">
            {/* Back / Close Button */}
            <button
              type="button"
              data-testid="viewer-close-btn"
              onClick={handleCloseMobileViewer}
              aria-label="Back to product"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all focus-visible:outline-none"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            {/* Counter Badge */}
            <div className="text-xs font-semibold text-neutral-300 tracking-wider">
              {activeImageIndex + 1} / {safeImages.length}
            </div>

            {/* Viewer Zoom & Close Controls */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                data-testid="viewer-zoom-in-btn"
                onClick={handleMobileZoomIn}
                disabled={mobileZoomScale >= 3.5}
                aria-label="Zoom in image"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 active:scale-95 transition-all focus-visible:outline-none"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                type="button"
                data-testid="viewer-zoom-out-btn"
                onClick={handleMobileZoomOut}
                disabled={mobileZoomScale <= 1}
                aria-label="Zoom out image"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 active:scale-95 transition-all focus-visible:outline-none"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              {mobileZoomScale > 1 && (
                <button
                  type="button"
                  data-testid="viewer-reset-btn"
                  onClick={handleMobileResetZoom}
                  aria-label="Reset image zoom"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all focus-visible:outline-none"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                data-testid="viewer-close-btn-top"
                onClick={handleCloseMobileViewer}
                aria-label="Close image viewer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-neutral-300 hover:bg-white/20 active:scale-95 transition-all focus-visible:outline-none"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Main Inspection Canvas */}
          <div
            className="flex-1 relative w-full overflow-hidden flex items-center justify-center p-2"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onDoubleClick={handleDoubleTap}
          >
            {/* Main Full-Size Image Container */}
            <div
              data-testid="viewer-displayed-image"
              className="relative w-full h-full max-h-[78vh] flex items-center justify-center"
              style={{
                transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${mobileZoomScale})`,
                transition: isDragging ? 'none' : 'transform 200ms ease-out',
                cursor: mobileZoomScale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
              }}
            >
              {currentImage ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src={currentImage}
                    alt={`${title} - View ${activeImageIndex + 1}`}
                    fill
                    priority
                    sizes="100vw"
                    className="object-contain pointer-events-none"
                  />
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center text-neutral-600">
                  <ShoppingBag className="h-20 w-20" />
                </div>
              )}
            </div>

            {/* Navigation Chevrons inside viewer (when at normal 1x zoom or multi-image) */}
            {safeImages.length > 1 && mobileZoomScale === 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-black/50 border border-white/20 text-white shadow-lg backdrop-blur-md hover:bg-black/80 active:scale-95 transition-all focus-visible:outline-none"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-black/50 border border-white/20 text-white shadow-lg backdrop-blur-md hover:bg-black/80 active:scale-95 transition-all focus-visible:outline-none"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Bar: Color Swatches (Rendered only when color options exist) */}
          {colorOption && colorOption.values && colorOption.values.length > 0 && (
            <div
              data-testid="viewer-color-selector"
              className="relative z-20 px-4 py-3 bg-neutral-900/90 backdrop-blur-md border-t border-white/10 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-300">
                  {colorOption.title}:{' '}
                  <span className="text-white font-bold">{colorOption.selectedValue || 'Select'}</span>
                </span>
                <span className="text-[11px] text-neutral-400">Tap to switch color</span>
              </div>

              {/* Horizontal Color Swatches Row */}
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                {colorOption.values.map((colVal) => {
                  const isSelected = colorOption.selectedValue === colVal;
                  const hex = getColorHex(colVal);

                  return (
                    <button
                      key={colVal}
                      type="button"
                      data-testid={`viewer-color-swatch-${colVal}`}
                      onClick={() => {
                        colorOption.onSelectColor(colVal);
                        setMobileZoomScale(1);
                        setPan({ x: 0, y: 0 });
                      }}
                      aria-label={`Select color ${colVal}`}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all shrink-0 active:scale-95 focus-visible:outline-none',
                        isSelected
                          ? 'border-white bg-white/20 text-white ring-2 ring-white/50 shadow-sm'
                          : 'border-white/20 bg-black/40 text-neutral-300 hover:border-white/40 hover:bg-white/10'
                      )}
                    >
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-white/40 shrink-0"
                        style={{ backgroundColor: hex }}
                      />
                      <span>{colVal}</span>
                      {isSelected && <Check className="h-3 w-3 text-white ml-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
PdpImageGallery.displayName = 'PdpImageGallery';
