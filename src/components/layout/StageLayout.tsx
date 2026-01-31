/**
 * StageLayout - Viewport-controlled stage container for all interactive screens
 *
 * Architecture:
 * - Fixed 100dvh (100vh fallback) grid with 3 rows: [auto, 1fr, auto]
 * - Header zone: Progress bar, section label (fixed at top)
 * - Content zone: Main content (scrollable if needed via min-h-0)
 * - CTA zone: Continue button (fixed at bottom)
 *
 * Key features:
 * - No page-level scrolling (stage is viewport-locked)
 * - Overlay images supported (with safe padding)
 * - CSS-driven responsive behavior (no JS height calculations)
 * - Flexible background via bgClass prop
 * - Multiple variants: question, insert, gate, result
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { OverlayImage } from '../quiz/OverlayImage';

interface OverlayImageConfig {
  src: string;
  alt: string;
  anchor?: 'bottom-right' | 'bottom-left' | 'center-right';
  maxHeightDesktop?: string;
  maxHeightMobile?: string;
}

interface StageLayoutProps {
  children: React.ReactNode;

  // Header configuration
  showProgress?: boolean;
  progressPercent?: number;
  sectionLabel?: string;

  // CTA configuration
  showCTA?: boolean;
  ctaLabel?: string;
  ctaDisabled?: boolean;
  onCtaClick?: () => void;

  // Back button configuration
  showBackButton?: boolean;
  onBackClick?: () => void;

  // Overlay configuration
  overlayImage?: OverlayImageConfig;

  // Layout variant
  variant?: 'question' | 'insert' | 'gate' | 'result';

  // NEW: Custom background class (overrides variant default)
  bgClass?: string;
}

const VARIANT_CONFIGS = {
  question: {
    showProgress: true,
    contentAlignment: 'flex flex-col items-center justify-start',
    contentMaxWidth: 'max-w-2xl',
    bgClass: 'bg-gray-50',
    contentPadding: 'px-4 pt-6 pb-4 md:px-6 md:pt-18 md:pb-6',
    hasSafePadding: true, // Add right padding when overlay present
    allowScroll: true,
  },
  insert: {
    showProgress: false,
    contentAlignment: 'items-center justify-center',
    contentMaxWidth: 'max-w-2xl',
    bgClass: 'bg-white',
    contentPadding: 'px-0 py-0',
    hasSafePadding: false,
    allowScroll: false, // NO SCROLLING for insert screens
  },
  gate: {
    showProgress: false,
    contentAlignment: 'items-center justify-center',
    contentMaxWidth: 'max-w-7xl',
    bgClass: 'bg-white',
    contentPadding: 'px-6 py-4 md:px-8 md:py-6',
    hasSafePadding: false,
    allowScroll: false, // NO SCROLLING for gate screens
  },
  result: {
    showProgress: false,
    contentAlignment: 'flex flex-col items-center justify-start',
    contentMaxWidth: 'max-w-2xl',
    bgClass: 'bg-white', // Default (can be overridden by bgClass prop)
    contentPadding: 'px-4 pt-3 pb-2 md:px-6',
    hasSafePadding: false,
    allowScroll: true, // Results screens may need scrolling
  },
};

export function StageLayout({
  children,
  showProgress = false,
  progressPercent = 0,
  sectionLabel,
  showCTA = false,
  ctaLabel = 'Pokračovat',
  ctaDisabled = false,
  onCtaClick,
  showBackButton = false,
  onBackClick,
  overlayImage,
  variant = 'question',
  bgClass, // NEW: Custom background class
}: StageLayoutProps) {
  const config = VARIANT_CONFIGS[variant];

  // Override showProgress if variant has default
  const shouldShowProgress = config.showProgress && showProgress;

  // Use custom bgClass if provided, otherwise use variant default
  const backgroundClass = bgClass || config.bgClass;

  return (
    <div
      className={cn(
        'stage-layout',
        'h-screen', // Fallback for older browsers
        'h-dvh', // Dynamic viewport height (accounts for mobile browser chrome)
        'grid grid-rows-[auto_1fr_auto]',
        'overflow-hidden', // Prevent page-level scrolling
        backgroundClass
      )}
    >
      {/* BACK BUTTON - Absolute positioned at top left */}
      {showBackButton && onBackClick && (
        <button
          onClick={onBackClick}
          className="absolute top-4 left-4 z-30 text-2xl md:text-3xl text-gray-700 hover:text-gray-900 transition-colors"
          aria-label="Zpět"
        >
          &lt;
        </button>
      )}

      {/* HEADER ZONE - Fixed at top */}
      {(shouldShowProgress || sectionLabel) && (
        <header className="flex-shrink-0 bg-white border-b border-gray-200">
          {shouldShowProgress && (
            <div className="relative h-1 md:h-1.5 bg-gray-200">
              <div
                className="absolute inset-y-0 left-0 bg-[#F9A201] transition-all duration-150"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
          {sectionLabel && (
            <div className="py-2 px-4 text-center">
              <p className="text-xs md:text-sm font-medium text-gray-600">{sectionLabel}</p>
            </div>
          )}
        </header>
      )}

      {/* CONTENT ZONE - Scrollable only for question/result variants */}
      <main
        className={cn(
          'relative',
          'min-h-0', // Critical: allows overflow scrolling in grid children
          config.allowScroll ? 'overflow-y-auto' : 'overflow-hidden', // Insert/gate variants: NO scroll
          config.contentAlignment
        )}
      >
        <div
          className={cn(
            'w-full',
            config.contentMaxWidth,
            'mx-auto',
            config.contentPadding,
            // Add safe padding on right when overlay image is present
            overlayImage && config.hasSafePadding && 'pr-8 md:pr-24 lg:pr-32'
          )}
        >
          {children}
        </div>

        {/* OVERLAY IMAGE LAYER - Absolute positioned, non-interactive */}
        {overlayImage && (
          <OverlayImage
            src={overlayImage.src}
            alt={overlayImage.alt}
            anchor={overlayImage.anchor || 'bottom-right'}
            maxHeightDesktop={overlayImage.maxHeightDesktop}
            maxHeightMobile={overlayImage.maxHeightMobile}
          />
        )}
      </main>

      {/* CTA ZONE - Fixed at bottom */}
      {showCTA && (
        <footer className="flex-shrink-0 bg-white border-t border-gray-200 p-4 md:p-4 shadow-2xl sticky bottom-0 z-10">
          <button
            onClick={onCtaClick}
            disabled={ctaDisabled}
            className={cn(
              'w-full max-w-md mx-auto block',
              'px-6 py-3 md:py-3',
              'text-white font-bold text-base md:text-lg',
              'rounded-lg',
              'transition-all duration-200',
              ctaDisabled
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-[#F9A201] hover:bg-[#E09301] active:scale-[0.98]'
            )}
          >
            {ctaLabel}
          </button>
        </footer>
      )}
    </div>
  );
}
