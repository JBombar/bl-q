'use client';

import { motion } from 'framer-motion';
import { GUARANTEE } from '@/config/sales-page.config';

export function GuaranteeBox() {
  return (
    <section className="py-16 px-4 bg-gradient-to-b from-white to-green-50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="bg-white rounded-2xl p-8 md:p-12 shadow-2xl border-2 border-green-200"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          {/* Icon */}
          <div className="text-center mb-6">
            <div className="inline-block w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-4xl mb-4 shadow-lg">
              {GUARANTEE.icon}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {GUARANTEE.title}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {GUARANTEE.description}
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {GUARANTEE.features.map((feature, index) => (
              <motion.div
                key={index}
                className="text-center p-4 bg-green-50 rounded-xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-green-600 text-2xl mb-2">✓</div>
                <p className="text-sm font-medium text-gray-700">{feature}</p>
              </motion.div>
            ))}
          </div>

          {/* Badge */}
          <div className="text-center mt-8">
            <div className="inline-block bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-full font-bold shadow-lg">
              100% RISK-FREE
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
