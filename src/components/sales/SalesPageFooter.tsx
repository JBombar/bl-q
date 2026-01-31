'use client';

import { FOOTER } from '@/config/sales-page.config';

export function SalesPageFooter() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Logo and Description */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">BL</span>
            </div>
            <span className="text-2xl font-bold">Better Lady</span>
          </div>
          <p className="text-gray-400 max-w-md mx-auto">
            Pomáháme ženám dosáhnout vnitřního klidu a radosti ze života
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm">
          {FOOTER.links.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 mb-8" />

        {/* Copyright and Trust Badges */}
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-4">{FOOTER.copyright}</p>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <span>🔒</span>
              <span>Zabezpečené platby Stripe</span>
            </div>
            <div className="flex items-center gap-1">
              <span>✓</span>
              <span>30denní záruka vrácení peněz</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🇨🇿</span>
              <span>Česká společnost</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
