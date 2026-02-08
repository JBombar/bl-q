'use client';

import { FOOTER } from '@/config/sales-page.config';

/**
 * SalesPageFooter Component
 * Minimal footer with links and copyright
 */
export function SalesPageFooter() {
  return (
    <footer className="py-8 px-6 bg-white font-figtree border-t border-[#E4E4E4]">
      <div className="max-w-[500px] mx-auto">
        <p className="text-[15px] text-[#140c0c] text-center">
          {FOOTER.links.map((link, index) => (
            <span key={index}>
              <a
                href={link.href}
                className="hover:underline transition-colors"
              >
                {link.label}
              </a>
              {' | '}
            </span>
          ))}
          {FOOTER.copyright}
        </p>
      </div>
    </footer>
  );
}
