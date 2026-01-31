'use client';

import { motion } from 'framer-motion';
import { ModuleAccordion } from './ModuleAccordion';
import { PROGRAM_MODULES } from '@/config/sales-page.config';

export function CurriculumSection() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Co tě čeká v programu
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            90denní cesta rozdělen na 6 modulů. Každý modul obsahuje praktické lekce a cvičení.
          </p>
        </motion.div>

        {/* Modules */}
        <div className="space-y-4">
          {PROGRAM_MODULES.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ModuleAccordion module={module} defaultExpanded={index === 0} />
            </motion.div>
          ))}
        </div>

        {/* Timeline Visual */}
        <motion.div
          className="mt-12 bg-gradient-to-r from-purple-50 to-green-50 rounded-xl p-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-sm font-semibold text-gray-700 mb-2">
            📅 Celková délka programu
          </p>
          <p className="text-3xl font-bold text-gray-900">90 dní</p>
          <p className="text-sm text-gray-600 mt-2">
            12 týdnů systematického vedení k vnitřnímu klidu
          </p>
        </motion.div>
      </div>
    </section>
  );
}
