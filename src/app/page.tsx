import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Quiz Funnel Application
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Discover personalized insights through our interactive quiz
        </p>

        <Link
          href="/q/stress-quiz"
          className="inline-block px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
        >
          Start Stress Assessment Quiz →
        </Link>

        <div className="mt-12 p-6 bg-white rounded-xl shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            What you'll get:
          </h2>
          <ul className="text-left space-y-2 text-gray-700">
            <li className="flex items-center">
              <span className="text-green-600 mr-2">✓</span>
              Personalized stress level assessment
            </li>
            <li className="flex items-center">
              <span className="text-green-600 mr-2">✓</span>
              Customized recommendations
            </li>
            <li className="flex items-center">
              <span className="text-green-600 mr-2">✓</span>
              Expert-curated stress management resources
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
