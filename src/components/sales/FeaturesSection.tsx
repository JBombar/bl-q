'use client';

import { motion } from 'framer-motion';
import { FeatureSpotlight } from './FeatureSpotlight';
import { FEATURES } from '@/config/sales-page.config';

export function FeaturesSection() {
  return (
    <section className="py-16 px-4 bg-linear-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Nástroje pro tvou transformaci
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Získáš přístup k unikátním nástrojům, které ti pomohou dosáhnout trvalých změn
          </p>
        </motion.div>

        {/* Features */}
        <div className="space-y-24">
          {FEATURES.map((feature, index) => (
            <FeatureSpotlight key={feature.id} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
