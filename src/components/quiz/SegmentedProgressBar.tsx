'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';

interface SegmentedProgressBarProps {
  /** Total number of segments (questions in category) */
  totalSegments: number;

  /** Number of completed segments (1-indexed current position) */
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

/**
 * SegmentedProgressBar - Category-scoped progress indicator
 *
 * Displays a series of horizontal segments where completed segments
 * are filled with the active color. Used to show progress within
 * a quiz category/section.
 *
 * @example
 * // 4 total questions, currently on question 2
 * <SegmentedProgressBar totalSegments={4} completedSegments={2} />
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

  return (
    <div
      className={cn('flex w-full', className)}
      style={{ gap: `${gapSize}px` }}
      role="progressbar"
      aria-valuenow={completedSegments}
      aria-valuemin={1}
      aria-valuemax={totalSegments}
      aria-label={`Progress: ${completedSegments} of ${totalSegments}`}
    >
      {Array.from({ length: totalSegments }, (_, index) => {
        const segmentNumber = index + 1;
        const isCompleted = segmentNumber <= completedSegments;

        return (
          <div
            key={index}
            className="h-1 md:h-1.5 rounded-full flex-1 transition-colors duration-200"
            style={{
              backgroundColor: isCompleted ? activeColor : inactiveColor,
            }}
            aria-hidden="true"
          />
        );
      })}
    </div>
  );
});

export default SegmentedProgressBar;
