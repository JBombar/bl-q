'use client';

import { motion } from 'framer-motion';
import { ScoreDisplay } from './ScoreDisplay';
import { ResultDescription } from './ResultDescription';
import { ProductRecommendation } from './ProductRecommendation';
import type { QuizResult, ProductOffer } from '@/types';

interface ResultScreenProps {
  result: QuizResult;
  offer: ProductOffer;
}

export function ResultScreen({ result, offer }: ResultScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-linear-to-br from-purple-50 to-pink-100 py-12 px-4"
    >
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <ScoreDisplay
            score={result.result_score || 0}
            segment={result.result_value}
            label={result.result_label || ''}
          />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <ResultDescription description={result.result_description || ''} />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <ProductRecommendation offer={offer} />
        </motion.div>
      </div>
    </motion.div>
  );
}
