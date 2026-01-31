'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ResultHeaderProps {
  title: string;
  subtitle?: string;
  variant?: 'centered' | 'left';
  showLogo?: boolean;
}

/**
 * ResultHeader - Title and subtitle for result screens
 * Matches Better Lady design with optional logo
 */
export function ResultHeader({
  title,
  subtitle,
  variant = 'centered',
  showLogo = true,
}: ResultHeaderProps) {
  return (
    <div className={cn('mb-6', variant === 'centered' ? 'text-center' : 'text-left')}>
      {/* Better Lady Logo */}
      {showLogo && (
        <motion.div
          className="flex justify-center mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Image
            src="/images/logo/betterlady-logo.svg"
            alt="Better Lady"
            width={120}
            height={30}
            priority
          />
        </motion.div>
      )}

      {/* Title */}
      <motion.h1
        className="text-xl md:text-2xl font-bold text-gray-900 mb-2 px-4"
        style={{ fontFamily: 'Figtree', lineHeight: '1.2' }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {title}
      </motion.h1>

      {/* Subtitle */}
      {subtitle && (
        <motion.p
          className="text-sm text-gray-600 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
