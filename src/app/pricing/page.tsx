'use client'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { 
  Check, 
  X, 
  ArrowRight,
  Zap,
  Star,
  Users,
  Building,
  Loader2,
  Lock
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { createSubscriptionCheckout } from '@/lib/payments'
import StripeCheckoutModal from '@/components/payments/StripeCheckoutModal'

// Stripe Price IDs - Replace these with your actual Stripe Price IDs
// You can get these from your Stripe Dashboard > Products > Prices
// Or set them via environment variables: NEXT_PUBLIC_STRIPE_PRICE_STARTER, etc.
const STRIPE_PRICE_IDS = {
  starter: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || 'price_starter_placeholder',
  professional: process.env.NEXT_PUBLIC_STRIPE_PRICE_PROFESSIONAL || 'price_professional_placeholder',
  enterprise: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE || 'price_enterprise_placeholder',
}

const plans = [
  {
    name: 'Starter',
    id: 'starter',
    description: 'Perfect for small businesses getting started with AI marketing',
    price: 299,
    period: 'month',
    icon: Zap,
    popular: false,
    priceId: STRIPE_PRICE_IDS.starter,
    features: [
      'AI Content Generation (50 pieces/month)',
      'Basic SEO Optimization',
      'Social Media Scheduling',
      'Email Support',
      'Analytics Dashboard',
      '1 User Account'
    ],
    limitations: [
      'No AI Chatbot',
      'Limited Customization',
      'Basic Reporting'
    ],
    cta: 'Subscribe Now',
  },
  {
    name: 'Professional',
    id: 'professional',
    description: 'Ideal for growing businesses that need comprehensive AI marketing',
    price: 799,
    period: 'month',
    icon: Users,
    popular: true,
    priceId: STRIPE_PRICE_IDS.professional,
    features: [
      'AI Content Generation (200 pieces/month)',
      'Advanced SEO Optimization',
      'Social Media Marketing Automation',
      'AI Chatbot (1 bot)',
      'Priority Support',
      'Advanced Analytics',
      '5 User Accounts',
      'Custom Brand Voice',
      'A/B Testing',
      'Integration Support'
    ],
    limitations: [
      'Limited Custom Integrations'
    ],
    cta: 'Subscribe Now',
  },
  {
    name: 'Enterprise',
    id: 'enterprise',
    description: 'Complete AI marketing solution for large organizations',
    price: 1999,
    period: 'month',
    icon: Building,
    popular: false,
    priceId: STRIPE_PRICE_IDS.enterprise,
    features: [
      'Unlimited AI Content Generation',
      'Full SEO Suite',
      'Multi-Platform Social Media',
      'Multiple AI Chatbots',
      '24/7 Dedicated Support',
      'Custom Analytics',
      'Unlimited User Accounts',
      'White-label Solutions',
      'API Access',
      'Custom Integrations',
      'Dedicated Account Manager',
      'Custom Training'
    ],
    limitations: [],
    cta: 'Contact Sales',
    isEnterprise: true,
  }
]

const features = [
  {
    name: 'AI Content Generation',
    description: 'Create high-quality, engaging content at scale',
    tiers: {
      starter: '50 pieces/month',
      professional: '200 pieces/month',
      enterprise: 'Unlimited'
    }
  },
  {
    name: 'SEO Optimization',
    description: 'Boost your search rankings with AI-powered strategies',
    tiers: {
      starter: 'Basic',
      professional: 'Advanced',
      enterprise: 'Full Suite'
    }
  },
  {
    name: 'Social Media Marketing',
    description: 'Automate and optimize your social media presence',
    tiers: {
      starter: 'Scheduling',
      professional: 'Automation',
      enterprise: 'Multi-Platform'
    }
  },
  {
    name: 'AI Chatbots',
    description: 'Deploy intelligent chatbots for customer engagement',
    tiers: {
      starter: 'Not included',
      professional: '1 bot',
      enterprise: 'Multiple bots'
    }
  },
  {
    name: 'Analytics & Reporting',
    description: 'Track performance with detailed analytics',
    tiers: {
      starter: 'Basic',
      professional: 'Advanced',
      enterprise: 'Custom'
    }
  },
  {
    name: 'Support',
    description: 'Get help when you need it',
    tiers: {
      starter: 'Email',
      professional: 'Priority',
      enterprise: '24/7 Dedicated'
    }
  }
]

const faqs = [
  {
    question: 'Can I change plans anytime?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any billing differences.'
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes, all plans come with a 14-day free trial. No credit card required to start.'
  },
  {
    question: 'What happens if I exceed my content limit?',
    answer: 'We\'ll notify you when you\'re approaching your limit. You can upgrade your plan or purchase additional content credits.'
  },
  {
    question: 'Do you offer custom solutions?',
    answer: 'Yes, our Enterprise plan includes custom solutions. We also offer custom development for specific needs.'
  },
  {
    question: 'Is there a setup fee?',
    answer: 'No setup fees for Starter and Professional plans. Enterprise plans may include setup costs depending on requirements.'
  },
  {
    question: 'What integrations are available?',
    answer: 'We integrate with popular tools like HubSpot, Salesforce, WordPress, Shopify, and many more. Custom integrations are available for Enterprise customers.'
  }
]

export default function PricingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null)
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false)

  const handleSubscribe = async (plan: typeof plans[0]) => {
    if (plan.isEnterprise) {
      window.location.href = '/contact?plan=enterprise'
      return
    }

    if (!isAuthenticated) {
      window.location.href = '/auth/login?redirect=/pricing'
      return
    }

    if (!plan.priceId || plan.priceId.includes('placeholder')) {
      setError('This plan is not yet available. Please contact sales for Enterprise plans.')
      return
    }

    setError(null)
    setSelectedPlan(plan)
    setIsModalOpen(true)
    setCheckoutUrl(null)
    setCheckoutError(null)
    setIsCheckoutLoading(true)

    try {
      const url = await createSubscriptionCheckout({
        priceId: plan.priceId,
        userId: user?.id,
      })
      setCheckoutUrl(url)
      setIsCheckoutLoading(false)
    } catch (err: any) {
      console.error('Subscription error:', err)
      setCheckoutError(err.message || 'Failed to start checkout. Please try again.')
      setIsCheckoutLoading(false)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedPlan(null)
    setCheckoutUrl(null)
    setCheckoutError(null)
    setIsCheckoutLoading(false)
    setLoadingPlan(null)
  }

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token')
      const userData = localStorage.getItem('user')
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData)
          setIsAuthenticated(true)
          setUser(parsedUser)
        } catch (e) {
          setIsAuthenticated(false)
          setUser(null)
        }
      } else {
        setIsAuthenticated(false)
        setUser(null)
      }
      setAuthLoading(false)
    }

    checkAuth()
  }, [])

  useEffect(() => {
    // Clear error after 5 seconds
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-600 to-purple-600 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Simple, Transparent
              <span className="text-blue-600"> Pricing</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Choose the perfect plan for your business. All plans include a 14-day free trial with no credit card required.
            </p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="rounded-md bg-red-50 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Plans */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-3xl p-8 ring-1 ${
                  plan.popular
                    ? 'bg-blue-600 ring-blue-600 text-white'
                    : 'bg-white ring-gray-900/10 text-gray-900'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="flex items-center gap-1 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-medium">
                      <Star className="h-4 w-4 fill-current" />
                      Most Popular
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-x-4 mb-6">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                    plan.popular ? 'bg-white/20' : 'bg-blue-600'
                  }`}>
                    <plan.icon className={`h-6 w-6 ${plan.popular ? 'text-white' : 'text-white'}`} />
                  </div>
                  <div>
                    <h3 className={`text-xl font-semibold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                      {plan.name}
                    </h3>
                    <p className={`text-sm ${plan.popular ? 'text-blue-100' : 'text-gray-600'}`}>
                      {plan.description}
                    </p>
                  </div>
                </div>
                
                <div className="mb-8">
                  <div className="flex items-baseline">
                    <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                      ${plan.price}
                    </span>
                    <span className={`ml-1 text-lg ${plan.popular ? 'text-blue-100' : 'text-gray-600'}`}>
                      /{plan.period}
                    </span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className={`h-5 w-5 flex-shrink-0 mt-0.5 mr-3 ${
                        plan.popular ? 'text-white' : 'text-green-500'
                      }`} />
                      <span className={`text-sm ${plan.popular ? 'text-blue-100' : 'text-gray-600'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                  {plan.limitations.map((limitation, index) => (
                    <li key={index} className="flex items-start opacity-60">
                      <X className={`h-5 w-5 flex-shrink-0 mt-0.5 mr-3 ${
                        plan.popular ? 'text-white' : 'text-gray-400'
                      }`} />
                      <span className={`text-sm ${plan.popular ? 'text-blue-100' : 'text-gray-500'}`}>
                        {limitation}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={loadingPlan === plan.id || authLoading}
                  className={`w-full rounded-lg px-4 py-3 font-medium transition-all flex items-center justify-center gap-2 ${
                    plan.popular
                      ? 'bg-white text-blue-600 hover:bg-gray-50'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loadingPlan === plan.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {isAuthenticated && <Lock className="h-4 w-4" />}
                      {plan.cta}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
                
                {!isAuthenticated && (
                  <p className="mt-3 text-center text-xs text-gray-500">
                    Sign in required to subscribe
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Compare Plans
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              See exactly what's included in each plan
            </p>
          </div>
          
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Features
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Starter
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Professional
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {features.map((feature, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{feature.name}</div>
                        <div className="text-sm text-gray-500">{feature.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {feature.tiers.starter}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {feature.tiers.professional}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {feature.tiers.enterprise}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need to know about our pricing and plans
            </p>
          </div>
          
          <div className="mx-auto max-w-3xl">
            <dl className="space-y-8">
              {faqs.map((faq, index) => (
                <div key={index}>
                  <dt className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</dt>
                  <dd className="text-gray-600">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100">
              Start your 14-day free trial today. No credit card required.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              {!isAuthenticated ? (
                <Button size="lg" variant="secondary" href="/auth/register">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button size="lg" variant="secondary" href="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600" href="/contact?plan=enterprise">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Stripe Checkout Modal */}
      {selectedPlan && (
        <StripeCheckoutModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          planName={selectedPlan.name}
          price={selectedPlan.price}
          period={selectedPlan.period}
          checkoutUrl={checkoutUrl}
          isLoading={isCheckoutLoading}
          error={checkoutError}
        />
      )}
    </div>
  )
}