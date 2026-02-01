'use client';

import { FOOTER } from '@/config/sales-page.config';

/**
 * SalesPageFooter Component
 * Minimal footer with links and copyright
 */
export function SalesPageFooter() {
  return (
    <footer className="py-8 px-4 bg-white font-figtree border-t border-gray-light">
      <div className="max-w-[500px] mx-auto">
        {/* Links */}
        <div className="flex flex-wrap justify-center gap-4 mb-4 text-sm">
          {FOOTER.links.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className="text-gray-500 hover:text-dark transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Copyright */}
        <p className="text-xs text-gray-400 text-center">
          {FOOTER.copyright}
        </p>
      </div>
    </footer>
  );
}
