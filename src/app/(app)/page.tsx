import Link from 'next/link';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-8 bg-gray-50">
      <div className="max-w-3xl w-full text-center">
        {/* Brand Logo/Name */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#F9A201] mb-2" style={{ fontFamily: 'Figtree' }}>
            BetterLady
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Test stresu a nervového systému
          </p>
        </div>

        {/* Main Headline */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6" style={{ fontFamily: 'Figtree', lineHeight: '110%' }}>
          Je tvůj nervový systém přehlcený?
        </h2>
        
        <p className="text-base md:text-xl text-gray-700 mb-8 md:mb-10 max-w-2xl mx-auto">
          Zjisti, jak moc je tvůj nervový systém přetížený a získej personalizované doporučení pro lepší pohodu.
        </p>

        {/* CTA Button */}
        <Link
          href="/q/stress-quiz"
          className="inline-block px-8 md:px-10 py-3 md:py-4 bg-[#F9A201] text-white text-base md:text-lg font-bold rounded-lg hover:bg-[#E09301] transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
          style={{ fontFamily: 'Figtree' }}
        >
          Začít test →
        </Link>

        {/* Benefits Section */}
        <div className="mt-12 md:mt-16 p-6 md:p-8 bg-white rounded-xl md:rounded-2xl shadow-lg">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6" style={{ fontFamily: 'Figtree' }}>
            Co získáš:
          </h3>
          <ul className="text-left space-y-3 md:space-y-4 text-gray-700 max-w-xl mx-auto">
            <li className="flex items-start">
              <span className="text-[#F9A201] mr-3 text-xl shrink-0">✓</span>
              <span className="text-sm md:text-base">Personalizované vyhodnocení úrovně tvého stresu</span>
            </li>
            <li className="flex items-start">
              <span className="text-[#F9A201] mr-3 text-xl shrink-0">✓</span>
              <span className="text-sm md:text-base">Doporučení na míru tvému nervovému systému</span>
            </li>
            <li className="flex items-start">
              <span className="text-[#F9A201] mr-3 text-xl shrink-0">✓</span>
              <span className="text-sm md:text-base">Odborné zdroje pro zvládání stresu a zlepšení pohody</span>
            </li>
          </ul>
        </div>

        {/* Trust Badge */}
        <p className="mt-8 text-xs md:text-sm text-gray-500">
          Test trvá pouze 2-3 minuty
        </p>
      </div>
    </main>
  );
}
