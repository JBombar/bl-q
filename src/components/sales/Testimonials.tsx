'use client';

import { motion } from 'framer-motion';
import { TESTIMONIALS } from '@/config/sales-page.config';
import { SECTION_HEADINGS } from '@/config/sales-page-content';

/**
 * Star Rating Component
 */
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <svg
          key={index}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={index < rating ? '#F9A201' : '#E5E7EB'}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
      ))}
    </div>
  );
}

/**
 * Testimonials Component
 * Matches figma_design.md "Testimonials Section" specification
 */
export function Testimonials() {
  return (
    <section className="py-12 px-4 bg-white font-figtree">
      <div className="max-w-[500px] mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold text-dark">
            {SECTION_HEADINGS.testimonials}
          </h2>
        </motion.div>

        {/* Testimonials List */}
        <div className="space-y-6">
          {TESTIMONIALS.slice(0, 3).map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              className="bg-card-bg rounded-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Rating */}
              <div className="mb-4">
                <StarRating rating={testimonial.rating} />
              </div>

              {/* Text */}
              <p className="text-base text-dark mb-4 leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Before/After Stats */}
              {testimonial.beforeAfter && (
                <div className="mb-4 p-3 bg-primary-green-light rounded-lg flex items-center justify-center gap-6">
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1">Před</p>
                    <p className="text-base font-bold text-red-500">
                      {testimonial.beforeAfter.before}
                    </p>
                  </div>
                  <span className="text-xl text-primary-green">→</span>
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1">Po</p>
                    <p className="text-base font-bold text-primary-green">
                      {testimonial.beforeAfter.after}
                    </p>
                  </div>
                </div>
              )}

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-light">
                <div className="w-10 h-10 bg-primary-green-light rounded-full flex items-center justify-center overflow-hidden shrink-0">
                  <span className="text-lg font-bold text-primary-green">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-dark text-sm">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {testimonial.age} let
                    {testimonial.location && ` • ${testimonial.location}`}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
