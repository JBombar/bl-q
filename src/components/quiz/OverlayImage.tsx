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
import { motion } from 'framer-motion';

interface OverlayImageProps {
  src: string;
  alt: string;
  anchor?: 'bottom-right' | 'bottom-left' | 'center-right';
  maxHeightDesktop?: string;
  maxHeightMobile?: string;
  className?: string;
}

const anchorClasses = {
  'bottom-right': 'bottom-0 right-0 translate-x-[2%]',
  'bottom-left': 'bottom-0 left-0 -translate-x-[2%]',
  'center-right': 'top-1/2 right-0 -translate-y-1/2 translate-x-[2%]',
};


export function OverlayImage({
  src,
  alt,
  anchor = 'bottom-right',
  maxHeightDesktop = '550px',
  maxHeightMobile = '450px',
  className,
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
      <motion.div
        className={cn(
          'pointer-events-none absolute z-0',
          // Desktop positioning (default)
          anchorClasses[anchor],
          // Mobile adjustments:
          // Smaller size (160px/40%) to prevent covering Likert scale options
          'w-[160px] md:w-auto max-w-[40%] md:max-w-none',
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div
          className="relative flex flex-col justify-end" // Fix: Align image to bottom of container to prevent gap
          style={{
            height: maxHeightDesktop || '600px', // Default fallback
            maxHeight: '80vh' // Never exceed 80% viewport height
          }}
        >
          <img
            src={src}
            alt={alt}
            className={cn(
              // Allow height to auto-scale based on width, but align to bottom if container is taller
              "block w-full h-auto object-contain object-bottom",
            )}
            style={{
              maxHeight: maxHeightMobile ? maxHeightMobile : undefined
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
