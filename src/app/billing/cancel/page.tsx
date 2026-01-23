'use client'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { XCircle, ArrowLeft, HelpCircle } from 'lucide-react'

export default function BillingCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-2xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8 text-center">
          <XCircle className="h-16 w-16 text-gray-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Cancelled
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Your subscription was not completed.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            No charges were made. You can try again anytime or contact us if you need assistance.
          </p>

          <div className="flex gap-4 justify-center mb-8">
            <Button href="/pricing" size="lg">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Pricing
            </Button>
            <Button href="/contact" variant="outline" size="lg">
              <HelpCircle className="mr-2 h-4 w-4" />
              Contact Support
            </Button>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 text-left">
            <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
            <p className="text-sm text-blue-800 mb-4">
              If you encountered any issues during checkout or have questions about our plans, 
              our support team is here to help.
            </p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Email: aimarketingagencyhelp@gmail.com</li>
              <li>• Phone: 1-800-XXX-XXXX</li>
              <li>• Live Chat: Available 24/7</li>
            </ul>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

