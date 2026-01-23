import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { ArrowRight, Brain, Target, TrendingUp, Users, Zap, Star } from 'lucide-react'

const features = [
  {
    name: 'AI Content Generation',
    description: 'Create high-quality, engaging content at scale with our advanced AI algorithms.',
    icon: Brain,
  },
  {
    name: 'SEO Optimization',
    description: 'Boost your search rankings with AI-powered SEO strategies and content optimization.',
    icon: Target,
  },
  {
    name: 'Social Media Automation',
    description: 'Automate engagement on Facebook, LinkedIn, Twitter & Reddit with AI-powered replies.',
    icon: TrendingUp,
    highlight: true,
  },
  {
    name: 'AI Chatbots',
    description: 'Deploy intelligent chatbots that engage customers 24/7 and drive conversions.',
    icon: Users,
  },
]

const stats = [
  { name: 'Clients Served', value: '500+' },
  { name: 'Content Generated', value: '1M+' },
  { name: 'ROI Increase', value: '300%' },
  { name: 'Time Saved', value: '80%' },
]

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'CEO, TechStart Inc.',
    content: 'AI Marketing Pro transformed our digital presence. Our organic traffic increased by 400% in just 3 months.',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Marketing Director, GrowthCorp',
    content: 'The AI content generation saved us 20 hours per week. The quality is outstanding and conversion rates improved significantly.',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'Founder, E-commerce Plus',
    content: 'Their SEO optimization strategies helped us rank #1 for our target keywords. Revenue increased by 250%.',
    rating: 5,
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-primary w-full overflow-x-hidden">
      <Header />
      
      {/* Hero Section */}
      <div className="relative isolate px-4 sm:px-6 pt-14 lg:px-8 w-full max-w-full">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56 w-full">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-white break-words">
              Grow Your Business with
              <span className="text-gradient"> AI-Powered Marketing</span>
            </h1>
            <p className="mt-6 text-base sm:text-lg leading-8 text-text-secondary break-words px-2">
              Transform your marketing with intelligent automation that drives real results. From AI-driven strategy to smart execution, we deliver measurable growth for your business.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-x-6 px-4">
              <Button size="lg" href="/auth/register" className="w-full sm:w-auto">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" href="/portfolio" className="w-full sm:w-auto whitespace-nowrap">Book a Free Consultation</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-24 sm:py-32 w-full overflow-x-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="mx-auto max-w-2xl lg:max-w-none w-full">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Start Your AI Journey Today
              </h2>
              <p className="mt-4 text-lg leading-8 text-text-secondary">
                Join hundreds of businesses already growing with AI-powered marketing automation. Get started with a free consultation and see how AI can transform your marketing.
              </p>
            </div>
            <dl className="mt-16 grid grid-cols-1 gap-8 sm:mt-20 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.name} className="flex flex-col-reverse">
                  <dt className="text-base leading-7 text-text-secondary">{stat.name}</dt>
                  <dd className="text-2xl font-bold leading-9 tracking-tight text-white">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 sm:py-32 w-full overflow-x-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary-light-purple">AI-Powered Solutions</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Everything you need to scale your marketing
            </p>
            <p className="mt-6 text-lg leading-8 text-text-secondary">
              Our comprehensive suite of AI tools automates and optimizes every aspect of your marketing strategy.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
              {features.map((feature) => (
                <div key={feature.name} className={`flex flex-col ${feature.highlight ? 'card border-2 border-purple-500 relative overflow-hidden' : 'card'}`}>
                  {feature.highlight && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                      NEW 🚀
                    </div>
                  )}
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                    <feature.icon className="h-5 w-5 flex-none text-primary-light-purple" aria-hidden="true" />
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-text-secondary">
                    <p className="flex-auto">{feature.description}</p>
                    {feature.highlight && (
                      <Button href="/social-scraper" variant="outline" className="mt-4 w-full">
                        Try Social Scraper →
                      </Button>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-24 sm:py-32 w-full overflow-x-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              What our clients say
            </h2>
            <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="card">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-text-secondary mb-4">
                    &ldquo;{testimonial.content}&rdquo;
                  </blockquote>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-text-muted">{testimonial.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-header w-full overflow-x-hidden">
        <div className="px-4 sm:px-6 py-24 sm:py-32 lg:px-8 w-full">
          <div className="mx-auto max-w-2xl text-center w-full">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to transform your marketing?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-text-secondary">
              Join the AI revolution and start growing your business with intelligent marketing solutions.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-x-6 px-4">
              <Button size="lg" href="/auth/register" className="w-full sm:w-auto">
                Start Your AI Journey Today
                <Zap className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" href="/pricing" className="w-full sm:w-auto whitespace-nowrap">View Pricing Plans</Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}