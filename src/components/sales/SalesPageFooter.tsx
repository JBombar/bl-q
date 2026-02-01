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
        {/* Links */}
        <div className="flex flex-wrap justify-center gap-4 mb-4">
          {FOOTER.links.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className="text-[14px] text-[#949BA1] hover:text-[#292424] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Copyright */}
        <p className="text-[12px] text-[#949BA1] text-center">
          {FOOTER.copyright}
        </p>
      </div>
    </footer>
  );
}
