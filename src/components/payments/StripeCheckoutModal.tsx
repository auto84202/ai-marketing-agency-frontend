'use client'

import { useEffect, useState } from 'react'
import { X, Loader2, CreditCard, Lock, CheckCircle, Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface StripeCheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  planName: string
  price: number
  period: string
  checkoutUrl: string | null
  isLoading: boolean
  error: string | null
}

export default function StripeCheckoutModal({
  isOpen,
  onClose,
  planName,
  price,
  period,
  checkoutUrl,
  isLoading,
  error,
}: StripeCheckoutModalProps) {
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    if (checkoutUrl && isOpen) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            window.location.href = checkoutUrl
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [checkoutUrl, isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Subscribe to {planName}
                </h2>
                <p className="mt-2 text-blue-100">
                  Secure payment powered by Stripe
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-white hover:bg-white/20 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="relative">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                  <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
                </div>
                <p className="mt-6 text-lg font-medium text-gray-900">
                  Preparing secure checkout...
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Please wait while we set up your subscription
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <X className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {checkoutUrl && !isLoading && !error && (
              <div className="space-y-6">
                {/* Plan Summary */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {planName} Plan
                      </h3>
                      <p className="text-sm text-gray-500">
                        Recurring subscription
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        ${price}
                      </div>
                      <div className="text-sm text-gray-500">/{period}</div>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>14-day free trial included</span>
                    </div>
                  </div>
                </div>

                {/* Security Features */}
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                        <Shield className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Secure Payment Processing
                      </h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-blue-600" />
                          <span>256-bit SSL encryption</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-blue-600" />
                          <span>PCI DSS compliant</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                          <span>Powered by Stripe</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Redirect Info */}
                <div className="rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Redirecting to secure checkout...
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        You'll be redirected in {countdown} second{countdown !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  </div>
                </div>

                {/* Manual Redirect Button */}
                <Button
                  onClick={() => window.location.href = checkoutUrl}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3"
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Continue to Secure Checkout
                </Button>

                <p className="text-xs text-center text-gray-500">
                  Your payment information is encrypted and secure. We never store your card details.
                </p>
              </div>
            )}

            {/* Cancel Button */}
            <div className="mt-6 text-center">
              <button
                onClick={onClose}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel subscription
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

