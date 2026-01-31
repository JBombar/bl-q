'use client';

import { motion } from 'framer-motion';
import type { Feature } from '@/config/sales-page.config';

export interface FeatureSpotlightProps {
  feature: Feature;
  index?: number;
}

export function FeatureSpotlight({ feature, index = 0 }: FeatureSpotlightProps) {
  const isEven = index % 2 === 0;

  return (
    <motion.div
      className={`
        grid md:grid-cols-2 gap-8 items-center
        ${isEven ? '' : 'md:grid-flow-dense'}
      `}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2 }}
    >
      {/* Image */}
      <div className={`${isEven ? '' : 'md:col-start-2'}`}>
        <div className="relative aspect-square bg-gradient-to-br from-purple-100 to-green-100 rounded-2xl overflow-hidden shadow-lg">
          {feature.imageUrl ? (
            <img
              src={feature.imageUrl}
              alt={feature.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-8xl">{feature.icon}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={`${isEven ? '' : 'md:col-start-1 md:row-start-1'}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#F9A201] to-orange-500 rounded-xl flex items-center justify-center text-2xl">
            {feature.icon}
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {feature.title}
          </h3>
        </div>
        <p className="text-lg text-gray-600 leading-relaxed">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
}
