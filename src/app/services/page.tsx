import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { 
  Brain, 
  Search, 
  Share2, 
  MessageSquare, 
  BarChart3, 
  Target, 
  Zap, 
  ArrowRight,
  CheckCircle,
  Users,
  TrendingUp,
  Clock
} from 'lucide-react'
import Link from 'next/link'

const services = [
  {
    id: 'content',
    name: 'AI Content Generation',
    description: 'Create high-quality, engaging content at scale with our advanced AI algorithms.',
    icon: Brain,
    features: [
      'Blog posts and articles',
      'Social media captions',
      'Email campaigns',
      'Product descriptions',
      'Ad copy and headlines',
      'Video scripts and content',
      'Content optimization',
      'Multilingual content'
    ],
    benefits: [
      'Save 80% of content creation time',
      'Consistent brand voice',
      'SEO-optimized content',
      'Unlimited content variations'
    ]
  },
  {
    id: 'images',
    name: 'AI Image Generation',
    description: 'Create stunning visuals for ads and social media with DALL·E and MidJourney integration.',
    icon: Target,
    features: [
      'AI-generated ad visuals',
      'Social media graphics',
      'Product mockups',
      'Brand-consistent imagery',
      'Custom illustrations',
      'Banner and header designs'
    ],
    benefits: [
      'Professional visuals in minutes',
      'Cost-effective design solutions',
      'Unlimited creative variations',
      'Brand-aligned aesthetics'
    ]
  },
  {
    id: 'seo',
    name: 'AI SEO & Ads Optimization',
    description: 'Boost your search rankings and ad performance with AI-powered optimization.',
    icon: Search,
    features: [
      'Automated keyword research',
      'Predictive ad performance',
      'Real-time A/B testing',
      'Budget optimization',
      'On-page SEO optimization',
      'Competitor analysis',
      'Ranking tracking'
    ],
    benefits: [
      'Average 300% traffic increase',
      'Maximize ROI with minimal spend',
      'ML-powered winner selection',
      'Automated optimization'
    ]
  },
  {
    id: 'social',
    name: 'AI Social Media Automation',
    description: 'Automate and optimize your social media presence with intelligent growth tools.',
    icon: Share2,
    features: [
      'Auto-generate posts and hashtags',
      'Optimal posting time scheduling',
      'Trend analysis across platforms',
      'Engagement optimization',
      'Comment response suggestions',
      'Cross-platform consistency',
      'Performance analytics'
    ],
    benefits: [
      '10x engagement increase',
      'AI-learned optimal timing',
      'Trending content identification',
      'Natural engagement growth'
    ]
  },
  {
    id: 'chatbot',
    name: 'AI Chatbots & Customer Engagement',
    description: 'Deploy intelligent chatbots that engage customers 24/7 and drive conversions.',
    icon: MessageSquare,
    features: [
      'Smart 24/7 chatbot deployment',
      'FAQ automation',
      'Booking and scheduling',
      'Product upselling',
      'Multilingual support',
      'CRM integration',
      'Lead qualification'
    ],
    benefits: [
      '24/7 customer engagement',
      '50% reduction in support costs',
      'Higher conversion rates',
      'Scalable customer service'
    ]
  },
  {
    id: 'analytics',
    name: 'AI Analytics & Reporting',
    description: 'Predict customer behavior and optimize campaigns with advanced AI analytics.',
    icon: BarChart3,
    features: [
      'Customer lifetime value prediction',
      'Audience segmentation with ML',
      'Real-time ROI tracking',
      'Predictive sales forecasting',
      'Trend analysis',
      'Performance dashboards',
      'Automated reporting'
    ],
    benefits: [
      'Data-driven decisions',
      'Predictive insights',
      'Automated optimization',
      'Comprehensive reporting'
    ]
  }
]

const process = [
  {
    step: 1,
    title: 'Discovery & Analysis',
    description: 'We analyze your business, goals, and current marketing performance.',
    icon: Target
  },
  {
    step: 2,
    title: 'Strategy Development',
    description: 'Create a customized AI-powered marketing strategy tailored to your needs.',
    icon: Brain
  },
  {
    step: 3,
    title: 'Implementation',
    description: 'Deploy AI tools and start generating results from day one.',
    icon: Zap
  },
  {
    step: 4,
    title: 'Optimization',
    description: 'Continuously optimize and scale your marketing efforts for maximum ROI.',
    icon: TrendingUp
  }
]

const stats = [
  { icon: Users, value: '500+', label: 'Happy Clients' },
  { icon: TrendingUp, value: '300%', label: 'Average ROI' },
  { icon: Clock, value: '80%', label: 'Time Saved' },
  { icon: BarChart3, value: '1M+', label: 'Content Pieces' }
]

export default function ServicesPage() {
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
              AI-Powered Marketing
              <span className="text-blue-600"> Services</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Transform your marketing with cutting-edge AI solutions. From content generation to SEO optimization, 
              we provide everything you need to scale your business.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" href="/contact">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" href="/pricing">View Pricing</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center">
                  <stat.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="mt-4 text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="mt-2 text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">Our Services</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Complete AI marketing solutions
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Choose from our comprehensive suite of AI-powered marketing services designed to drive growth and maximize ROI.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3">
              {services.map((service) => (
                <div key={service.id} className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 p-8">
                  <div className="flex items-center gap-x-4 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                      <service.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">{service.name}</h3>
                  </div>
                  
                  <p className="text-gray-600 mb-6">{service.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Features</h4>
                      <ul className="space-y-2">
                        {service.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Benefits</h4>
                      <ul className="space-y-2">
                        {service.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <Zap className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button href={`/contact?service=${service.id}`}>
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Process Section */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">Our Process</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              How we work with you
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Our proven 4-step process ensures maximum results and seamless implementation.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {process.map((step) => (
                <div key={step.step} className="text-center">
                  <div className="flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white">
                      <step.icon className="h-8 w-8" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-sm font-semibold text-blue-600">Step {step.step}</div>
                    <h3 className="mt-2 text-lg font-semibold text-gray-900">{step.title}</h3>
                    <p className="mt-2 text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
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
              Contact us today to discuss your AI marketing needs and get a customized solution.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" variant="secondary" href="/contact">
                Contact Us
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600" href="/pricing">View Pricing</Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
