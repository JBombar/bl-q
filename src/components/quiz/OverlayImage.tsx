/**
 * OverlayImage - Woman cutout image overlay for quiz screens
 *
 * Renders decorative images as absolute-positioned overlays that:
 * - Never push content down (not in document flow)
 * - Never block clicks (pointer-events: none)
 * - Anchor to bottom-right with partial crop effect
 * - Scale responsively on mobile
 * - Maintain cutout aesthetic from design screenshots
 */

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface OverlayImageProps {
  src: string;
  alt: string;
  anchor?: 'bottom-right' | 'bottom-left' | 'center-right';
  maxHeightDesktop?: string;
  maxHeightMobile?: string;
}

function getAnchorClasses(anchor: string) {
  switch (anchor) {
    case 'bottom-right':
      return 'bottom-0 right-0 translate-x-[8%] md:translate-x-[10%]';
    case 'bottom-left':
      return 'bottom-0 left-0 -translate-x-[8%] md:-translate-x-[10%]';
    case 'center-right':
      return 'top-1/2 right-0 -translate-y-1/2 translate-x-[8%] md:translate-x-[10%]';
    default:
      return 'bottom-0 right-0 translate-x-[8%] md:translate-x-[10%]';
  }
}

export function OverlayImage({
  src,
  alt,
  anchor = 'bottom-right',
  maxHeightDesktop = '70vh',
  maxHeightMobile = '50vh',
}: OverlayImageProps) {
  return (
    <div
      className={cn(
        'absolute inset-0',
        'overflow-hidden',
        'pointer-events-none', // Critical: never block clicks
        'z-10' // Above content, below modals
      )}
      aria-hidden="true"
    >
      <div
        className={cn(
          'absolute',
          getAnchorClasses(anchor)
        )}
      >
        <Image
          src={src}
          alt={alt}
          width={600}
          height={800}
          className={cn(
            'object-contain',
            'h-auto w-auto',
            // Responsive max-height classes
            'max-h-[50vh] md:max-h-[70vh]'
          )}
          priority={false}
          quality={85}
        />
      </div>
    </div>
  );
}
