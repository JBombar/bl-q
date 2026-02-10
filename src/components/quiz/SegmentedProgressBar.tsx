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

  return (
    <div
      className={cn('relative flex w-full', className)}
      style={{ gap: `${gapSize}px` }}
      role="progressbar"
      aria-valuenow={Math.round(fillPercent)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Progress: ${completedSegments} of ${totalSegments} questions`}
    >
      {/* Background: 5 fixed gray segments */}
      {Array.from({ length: FIXED_SEGMENT_COUNT }, (_, index) => (
        <div
          key={`bg-${index}`}
          className="h-1 md:h-1.5 rounded-full flex-1"
          style={{ backgroundColor: inactiveColor }}
          aria-hidden="true"
        />
      ))}

      {/* Overlay: single seamless fill bar clipped to fillPercent width */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          width: `${fillPercent}%`,
          transition: 'width 300ms ease-out',
        }}
        aria-hidden="true"
      >
        <div
          className="h-1 md:h-1.5 rounded-full w-full"
          style={{ backgroundColor: activeColor }}
        />
      </div>
    </div>
  );
});

export default SegmentedProgressBar;
