import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { 
  TrendingUp, 
  Users, 
  Target, 
  Clock, 
  ArrowRight,
  ExternalLink,
  BarChart3,
  Zap,
  Search,
  Share2,
  MessageSquare,
  Brain
} from 'lucide-react'
import Link from 'next/link'

const caseStudies = [
  {
    id: 1,
    title: 'E-commerce Store: 400% Traffic Increase',
    client: 'TechGear Solutions',
    industry: 'E-commerce',
    duration: '3 months',
    challenge: 'Low organic traffic and poor search rankings affecting sales.',
    solution: 'Implemented AI-powered SEO optimization and content generation strategy.',
    results: [
      { metric: 'Organic Traffic', before: '2,500', after: '12,500', improvement: '400%' },
      { metric: 'Search Rankings', before: 'Page 3', after: 'Top 5', improvement: 'Top 5' },
      { metric: 'Revenue', before: '$15K', after: '$45K', improvement: '200%' },
      { metric: 'Content Pieces', before: '5/month', after: '50/month', improvement: '900%' }
    ],
    services: ['AI Content Generation', 'SEO Optimization'],
    testimonial: 'AI Marketing Pro transformed our digital presence completely. The results exceeded our expectations.',
    testimonialAuthor: 'Sarah Johnson, CEO'
  },
  {
    id: 2,
    title: 'SaaS Platform: 300% Lead Generation',
    client: 'CloudFlow Inc.',
    industry: 'SaaS',
    duration: '4 months',
    challenge: 'Low lead generation and high customer acquisition costs.',
    solution: 'Deployed AI chatbot and automated social media marketing campaigns.',
    results: [
      { metric: 'Lead Generation', before: '50/month', after: '200/month', improvement: '300%' },
      { metric: 'Conversion Rate', before: '2%', after: '8%', improvement: '300%' },
      { metric: 'Cost per Lead', before: '$120', after: '$40', improvement: '67%' },
      { metric: 'Customer Support', before: '24h response', after: 'Instant', improvement: '24/7' }
    ],
    services: ['AI Chatbots', 'Social Media Marketing'],
    testimonial: 'The AI chatbot handles 80% of our customer inquiries and our lead quality has improved dramatically.',
    testimonialAuthor: 'Michael Chen, CMO'
  },
  {
    id: 3,
    title: 'Local Business: 250% Revenue Growth',
    client: 'Healthy Bites Restaurant',
    industry: 'Food & Beverage',
    duration: '6 months',
    challenge: 'Limited online presence and low local search visibility.',
    solution: 'Comprehensive local SEO and AI-generated content strategy.',
    results: [
      { metric: 'Local Search Rankings', before: 'Not Found', after: '#1 Position', improvement: 'First Page' },
      { metric: 'Online Orders', before: '20/day', after: '70/day', improvement: '250%' },
      { metric: 'Social Engagement', before: '50 likes', after: '500 likes', improvement: '900%' },
      { metric: 'Customer Reviews', before: '12', after: '150+', improvement: '1,150%' }
    ],
    services: ['Local SEO', 'Social Media Marketing', 'Content Generation'],
    testimonial: 'Our restaurant is now the top result for local searches. Business has never been better.',
    testimonialAuthor: 'Emily Rodriguez, Owner'
  },
  {
    id: 4,
    title: 'B2B Service: 500% Content Output',
    client: 'LegalTech Partners',
    industry: 'Professional Services',
    duration: '2 months',
    challenge: 'Inconsistent content production and low thought leadership visibility.',
    solution: 'AI content generation system for legal insights and thought leadership.',
    results: [
      { metric: 'Content Production', before: '2/week', after: '12/week', improvement: '500%' },
      { metric: 'Website Traffic', before: '1,000', after: '8,000', improvement: '700%' },
      { metric: 'Lead Quality', before: 'Low', after: 'High', improvement: 'Premium' },
      { metric: 'Industry Recognition', before: 'Limited', after: 'Thought Leader', improvement: 'Established' }
    ],
    services: ['AI Content Generation', 'SEO Optimization'],
    testimonial: 'We went from struggling to create content to being recognized as industry thought leaders.',
    testimonialAuthor: 'David Thompson, Managing Partner'
  }
]

const stats = [
  { icon: TrendingUp, value: '300%', label: 'Average ROI' },
  { icon: Users, value: '500+', label: 'Happy Clients' },
  { icon: Target, value: '95%', label: 'Goal Achievement' },
  { icon: Clock, value: '30 days', label: 'Average Results' }
]

const serviceIcons = {
  'AI Content Generation': Brain,
  'SEO Optimization': Search,
  'Social Media Marketing': Share2,
  'AI Chatbots': MessageSquare,
  'Local SEO': Target
}

export default function PortfolioPage() {
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
              Proven Results
              <span className="text-blue-600"> Case Studies</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              See how we've helped businesses transform their marketing with AI. Real results, real growth, real success stories.
            </p>
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

      {/* Case Studies Section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center mb-16">
            <h2 className="text-base font-semibold leading-7 text-blue-600">Success Stories</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Real results from real clients
            </p>
          </div>

          <div className="space-y-24">
            {caseStudies.map((study, index) => (
              <div key={study.id} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                <div className={`${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                  <div className="flex items-center gap-x-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{study.title}</h3>
                      <p className="text-sm text-gray-600">{study.client} • {study.industry} • {study.duration}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Challenge</h4>
                      <p className="text-gray-600">{study.challenge}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Solution</h4>
                      <p className="text-gray-600">{study.solution}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Services Used</h4>
                      <div className="flex flex-wrap gap-2">
                        {study.services.map((service, serviceIndex) => {
                          const IconComponent = (serviceIcons as any)[service] || Zap
                          return (
                            <span key={serviceIndex} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <IconComponent className="h-3 w-3" />
                              {service}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 italic">"{study.testimonial}"</p>
                      <p className="text-sm font-medium text-gray-900 mt-2">— {study.testimonialAuthor}</p>
                    </div>
                  </div>
                </div>
                
                <div className={`${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                  <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 p-8">
                    <h4 className="text-lg font-semibold text-gray-900 mb-6">Results</h4>
                    <div className="space-y-4">
                      {study.results.map((result, resultIndex) => (
                        <div key={resultIndex} className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{result.metric}</div>
                            <div className="text-xs text-gray-500">
                              {result.before} → {result.after}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">{result.improvement}</div>
                            <div className="text-xs text-gray-500">improvement</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to be our next success story?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100">
              Join hundreds of businesses that have transformed their marketing with AI. Let's discuss your goals.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" variant="secondary" href="/contact">
                Start Your Success Story
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600" href="/services">View Services</Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
