'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';

interface SegmentedProgressBarProps {
  /** Total questions in the current category */
  totalSegments: number;

  /** 1-indexed current position within category */
  completedSegments: number;

  /** Whether to show the progress bar at all */
  visible?: boolean;

  /** Custom active segment color */
  activeColor?: string;

  /** Custom inactive segment color */
  inactiveColor?: string;

  /** Gap between segments in pixels */
  gapSize?: number;

  /** Optional className for the container */
  className?: string;
}

const FIXED_SEGMENT_COUNT = 5;

/**
 * SegmentedProgressBar - Percentage-based progress indicator
 *
 * Displays five fixed horizontal segments that fill proportionally
 * based on the user's progress through a quiz category.
 * Uses totalSegments and completedSegments to calculate fill percentage.
 *
 * @example
 * // Category with 10 questions, currently on question 3 (30% fill)
 * <SegmentedProgressBar totalSegments={10} completedSegments={3} />
 */
export const SegmentedProgressBar = memo(function SegmentedProgressBar({
  totalSegments,
  completedSegments,
  visible = true,
  activeColor = '#327455', // primary-green
  inactiveColor = '#E5E7EB', // gray-200
  gapSize = 4,
  className,
}: SegmentedProgressBarProps) {
  // Don't render if not visible or no segments
  if (!visible || totalSegments <= 0) {
    return null;
  }

  const fillPercent = Math.min((completedSegments / totalSegments) * 100, 100);
  
  // Calculate fill percentage for each of the 5 segments
  const segmentFillPercentages = Array.from({ length: FIXED_SEGMENT_COUNT }, (_, index) => {
    const segmentStartPercent = (index / FIXED_SEGMENT_COUNT) * 100;
    const segmentEndPercent = ((index + 1) / FIXED_SEGMENT_COUNT) * 100;
    
    if (fillPercent <= segmentStartPercent) {
      return { fillPercent: 0, isActive: false }; // Not reached yet
    } else if (fillPercent >= segmentEndPercent) {
      return { fillPercent: 100, isActive: false }; // Fully filled (no transition needed)
    } else {
      // Partially filled - this is the active segment
      const segmentFill = ((fillPercent - segmentStartPercent) / (segmentEndPercent - segmentStartPercent)) * 100;
      return { fillPercent: segmentFill, isActive: true };
    }
  });

  return (
    <div
      className={cn('flex w-full', className)}
      style={{ gap: `${gapSize}px` }}
      role="progressbar"
      aria-valuenow={Math.round(fillPercent)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Progress: ${completedSegments} of ${totalSegments} questions`}
    >
      {/* Render 5 segments, each with its own fill */}
      {Array.from({ length: FIXED_SEGMENT_COUNT }, (_, index) => {
        const { fillPercent: segmentFill, isActive } = segmentFillPercentages[index];
        
        return (
          <div
            key={`segment-${index}`}
            className="relative h-1 md:h-1.5 rounded-full flex-1 overflow-hidden"
            style={{ backgroundColor: inactiveColor }}
          >
            {/* Fill overlay for this segment - only animate the active one */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                backgroundColor: activeColor,
                width: `${segmentFill}%`,
                transition: isActive ? 'width 300ms ease-out' : 'none',
              }}
              aria-hidden="true"
            />
          </div>
        );
      })}
    </div>
  );
});

export default SegmentedProgressBar;
