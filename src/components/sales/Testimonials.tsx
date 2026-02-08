'use client';

import { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import { TESTIMONIALS } from '@/config/sales-page.config';
import { SECTION_HEADINGS } from '@/config/sales-page-content';

/**
 * Star Rating Component
 * Gold/yellow filled stars (#F9A201)
 */
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <svg
          key={index}
          width="14"
          height="14"
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
 * Chevron Left Icon - Light gray (#949BA1)
 */
function ChevronLeftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 18L9 12L15 6" stroke="#949BA1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/**
 * Chevron Right Icon - Light gray (#949BA1)
 */
function ChevronRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 18L15 12L9 6" stroke="#949BA1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/**
 * Testimonials Component - Horizontal Carousel
 * Swipeable on mobile, arrow navigation on desktop
 */
export function Testimonials() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <section className="py-12 bg-white font-figtree">
      <div className="max-w-[500px] mx-auto px-6">
        {/* Section Header - Green title */}
        <div className="text-center mb-8">
          <h2 className="text-[28px] font-bold text-[#292424] leading-[28px]">
            {SECTION_HEADINGS.testimonials}
          </h2>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative max-w-[600px] mx-auto">
        {/* Navigation Button - Previous (Desktop Only) */}
        <button
          onClick={scrollPrev}
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-11 h-11 items-center justify-center bg-white rounded-full transition-all hover:shadow-lg"
          style={{
            border: '1.5px solid #E4E4E4',
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
          }}
          aria-label="Previous testimonial"
        >
          <ChevronLeftIcon />
        </button>

        {/* Navigation Button - Next (Desktop Only) */}
        <button
          onClick={scrollNext}
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-11 h-11 items-center justify-center bg-white rounded-full transition-all hover:shadow-lg"
          style={{
            border: '1.5px solid #E4E4E4',
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
          }}
          aria-label="Next testimonial"
        >
          <ChevronRightIcon />
        </button>

        {/* Embla Carousel */}
        <div className="relative overflow-hidden px-6 md:px-16" ref={emblaRef}>
          <div className="flex gap-4">
            {TESTIMONIALS.slice(0, 3).map((testimonial) => (
              <div
                key={testimonial.id}
                className="flex-[0_0_88%] min-w-0 md:flex-[0_0_92%]"
              >
                {/* Testimonial Card */}
                <div
                  className="bg-white rounded-[10px] p-5 h-full"
                  style={{
                    border: '1.5px solid #E4E4E4',
                    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  {/* Card Header: Photo, Name, Stars */}
                  <div className="flex items-center gap-3 mb-4">
                    {/* Profile Picture - 48x48 circular */}
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-[#F6F6F6]">
                      {testimonial.photo ? (
                        <Image
                          src={testimonial.photo}
                          alt={testimonial.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{
                            background: 'linear-gradient(180deg, rgba(50, 116, 85, 0.12) 0%, rgba(50, 116, 85, 0.03) 100%)'
                          }}
                        >
                          <span className="text-[20px] font-bold text-[#327455]">
                            {testimonial.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Name and Stars */}
                    <div>
                      <p className="font-bold text-[#292424] text-[18px] leading-tight mb-1">
                        {testimonial.name}
                      </p>
                      <StarRating rating={testimonial.rating} />
                    </div>
                  </div>

                  {/* Testimonial Text Container with Fade-Out Effect */}
                  <div className="relative">
                    {/* Scrollable Text Area */}
                    <div
                      className="max-h-[160px] overflow-y-auto pr-3 testimonial-scroll"
                      style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#D6D6D6 transparent',
                      }}
                    >
                      <p className="text-[15px] text-[#292424] leading-[1.6em] pb-6">
                        {testimonial.text}
                      </p>
                    </div>

                    {/* Fade-Out Gradient Overlay */}
                    <div
                      className="absolute bottom-0 left-0 right-3 h-12 pointer-events-none"
                      style={{
                        background: 'linear-gradient(to top, white 0%, rgba(255, 255, 255, 0) 100%)',
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Left Fade Overlay */}
          <div className="absolute top-0 bottom-0 left-0 w-16 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />

          {/* Right Fade Overlay */}
          <div className="absolute top-0 bottom-0 right-0 w-16 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .testimonial-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .testimonial-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .testimonial-scroll::-webkit-scrollbar-thumb {
          background-color: #D6D6D6;
          border-radius: 2px;
        }
        .testimonial-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #B0B0B0;
        }
      `}</style>
    </section>
  );
}
