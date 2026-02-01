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
        <div
          className="relative aspect-square rounded-[10px] overflow-hidden shadow-lg"
          style={{
            background: 'linear-gradient(180deg, rgba(50, 116, 85, 0.12) 0%, rgba(50, 116, 85, 0.03) 100%)'
          }}
        >
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
          <div className="w-12 h-12 bg-[#F9A201] rounded-[10px] flex items-center justify-center text-2xl">
            {feature.icon}
          </div>
          <h3 className="text-[24px] font-bold text-[#292424] leading-[1.2em]">
            {feature.title}
          </h3>
        </div>
        <p className="text-[16px] text-[#949BA1] leading-[1.5em]">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
}
