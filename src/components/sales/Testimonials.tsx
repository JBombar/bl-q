'use client';

import { motion } from 'framer-motion';
import { TESTIMONIALS } from '@/config/sales-page.config';

export function Testimonials() {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <span
        key={index}
        className={index < rating ? 'text-yellow-400' : 'text-gray-300'}
      >
        ★
      </span>
    ));
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Příběhy žen, které to dokázaly
          </h2>
          <p className="text-lg text-gray-600">
            Inspiruj se skutečnými příběhy transformace
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {TESTIMONIALS.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Rating */}
              <div className="flex items-center gap-1 mb-4 text-xl">
                {renderStars(testimonial.rating)}
              </div>

              {/* Text */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Before/After Stats */}
              {testimonial.beforeAfter && (
                <div className="mb-4 p-3 bg-green-50 rounded-lg flex items-center justify-center gap-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1">Před</p>
                    <p className="text-lg font-bold text-red-600">
                      {testimonial.beforeAfter.before}
                    </p>
                  </div>
                  <span className="text-2xl">→</span>
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1">Po</p>
                    <p className="text-lg font-bold text-green-600">
                      {testimonial.beforeAfter.after}
                    </p>
                  </div>
                </div>
              )}

              {/* Author */}
              <div className="flex items-center gap-4 border-t border-gray-100 pt-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-200 to-green-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                  {testimonial.photo ? (
                    <img
                      src={testimonial.photo}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-bold text-gray-600">
                      {testimonial.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {testimonial.age} let
                    {testimonial.location && ` • ${testimonial.location}`}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-lg text-gray-700 font-semibold">
            Buď další, kdo změní svůj život k lepšímu
          </p>
        </motion.div>
      </div>
    </section>
  );
}
