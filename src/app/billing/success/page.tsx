'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { CheckCircle, Loader2, XCircle } from 'lucide-react'
import { billingAPI } from '@/lib/api'

function BillingSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [subscription, setSubscription] = useState<any>(null)

  useEffect(() => {
    const verifySession = async () => {
      if (!sessionId) {
        setError('No session ID provided')
        setLoading(false)
        return
      }

      try {
        // Wait a moment for webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Try to get user ID from localStorage
        const userStr = localStorage.getItem('user')
        const user = userStr ? JSON.parse(userStr) : null
        
        if (user?.id) {
          try {
            const response = await billingAPI.getSubscription(user.id)
            setSubscription(response.data)
          } catch (err) {
            console.error('Failed to fetch subscription:', err)
            // Subscription might not be synced yet, that's okay
          }
        }
        
        setLoading(false)
      } catch (err: any) {
        console.error('Verification error:', err)
        setError(err.message || 'Failed to verify session')
        setLoading(false)
      }
    }

    verifySession()
  }, [sessionId])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-2xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          {loading ? (
            <div className="text-center">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verifying your subscription...
              </h2>
              <p className="text-gray-600">
                Please wait while we confirm your payment.
              </p>
            </div>
          ) : error ? (
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verification Failed
              </h2>
              <p className="text-gray-600 mb-6">
                {error}
              </p>
              <div className="flex gap-4 justify-center">
                <Button href="/pricing" variant="outline">
                  Back to Pricing
                </Button>
                <Button href="/contact">
                  Contact Support
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Payment Successful!
              </h1>
              <p className="text-lg text-gray-600 mb-2">
                Thank you for your subscription.
              </p>
              <p className="text-sm text-gray-500 mb-8">
                Your subscription has been activated. You can now access all premium features.
              </p>

              {subscription && (
                <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
                  <h3 className="font-semibold text-gray-900 mb-4">Subscription Details</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Status:</dt>
                      <dd className="text-sm font-medium text-gray-900 capitalize">
                        {subscription.status || 'Active'}
                      </dd>
                    </div>
                    {subscription.currentPeriodEnd && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Renewal Date:</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}

              <div className="flex gap-4 justify-center">
                <Button href="/dashboard" size="lg">
                  Go to Dashboard
                </Button>
                <Button href="/settings" variant="outline" size="lg">
                  Manage Subscription
                </Button>
              </div>

              <p className="mt-8 text-sm text-gray-500">
                A confirmation email has been sent to your email address.
                If you have any questions, please{' '}
                <a href="/contact" className="text-blue-600 hover:underline">
                  contact our support team
                </a>.
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default function BillingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
      </div>
    }>
      <BillingSuccessContent />
    </Suspense>
  )
}

// Force dynamic rendering
export const dynamic = 'force-dynamic'
