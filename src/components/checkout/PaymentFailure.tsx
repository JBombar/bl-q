'use client';

interface PaymentFailureProps {
  errorMessage?: string;
  onRetry: () => void;
}

export function PaymentFailure({ errorMessage, onRetry }: PaymentFailureProps) {
  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 to-pink-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md text-center">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-red-600 text-5xl">✕</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Failed
        </h1>

        <p className="text-gray-600 mb-2">
          {errorMessage || 'We couldn\'t process your payment.'}
        </p>

        <p className="text-sm text-gray-500 mb-8">
          Your card was not charged. Please try again or use a different payment method.
        </p>

        <div className="space-y-3">
          <button
            onClick={onRetry}
            className="w-full px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg"
          >
            Try Again
          </button>

          <button
            onClick={() => window.location.href = '/'}
            className="w-full px-8 py-3 text-gray-600 hover:text-gray-900"
          >
            Go Back
          </button>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Need help? Contact us at support@example.com
          </p>
        </div>
      </div>
    </div>
  );
}
