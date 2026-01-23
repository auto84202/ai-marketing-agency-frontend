import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { 
  Calendar, 
  Clock, 
  User, 
  ArrowRight,
  Search,
  Tag,
  TrendingUp,
  Brain,
  Target,
  Zap
} from 'lucide-react'
import Link from 'next/link'

const featuredPost = {
  title: 'The Future of AI in Marketing: 10 Trends to Watch in 2024',
  excerpt: 'Discover the latest AI marketing trends that are reshaping the industry and learn how to stay ahead of the competition.',
  author: 'Sarah Johnson',
  date: '2024-01-15',
  readTime: '8 min read',
  category: 'AI Trends',
  image: '/api/placeholder/800/400',
  slug: 'future-of-ai-marketing-2024'
}

const blogPosts = [
  {
    title: 'How AI Content Generation Can Save You 20 Hours Per Week',
    excerpt: 'Learn practical strategies for implementing AI content tools to dramatically reduce your content creation time.',
    author: 'Michael Chen',
    date: '2024-01-12',
    readTime: '6 min read',
    category: 'Content Marketing',
    image: '/api/placeholder/400/250',
    slug: 'ai-content-generation-time-savings'
  },
  {
    title: 'SEO Optimization with AI: A Complete Guide for 2024',
    excerpt: 'Master AI-powered SEO techniques to boost your search rankings and drive more organic traffic.',
    author: 'Emily Rodriguez',
    date: '2024-01-10',
    readTime: '10 min read',
    category: 'SEO',
    image: '/api/placeholder/400/250',
    slug: 'ai-seo-optimization-guide-2024'
  },
  {
    title: 'Building Effective AI Chatbots for Customer Engagement',
    excerpt: 'Step-by-step guide to creating AI chatbots that actually engage customers and drive conversions.',
    author: 'David Thompson',
    date: '2024-01-08',
    readTime: '7 min read',
    category: 'Chatbots',
    image: '/api/placeholder/400/250',
    slug: 'building-effective-ai-chatbots'
  },
  {
    title: 'Social Media Marketing Automation: Best Practices',
    excerpt: 'Discover how to automate your social media marketing while maintaining authentic engagement.',
    author: 'Lisa Wang',
    date: '2024-01-05',
    readTime: '5 min read',
    category: 'Social Media',
    image: '/api/placeholder/400/250',
    slug: 'social-media-automation-best-practices'
  },
  {
    title: 'ROI Tracking for AI Marketing Campaigns',
    excerpt: 'Learn how to measure and optimize the return on investment for your AI marketing initiatives.',
    author: 'Alex Kumar',
    date: '2024-01-03',
    readTime: '9 min read',
    category: 'Analytics',
    image: '/api/placeholder/400/250',
    slug: 'roi-tracking-ai-marketing-campaigns'
  },
  {
    title: 'The Psychology Behind AI-Generated Content',
    excerpt: 'Understanding how AI-generated content affects user behavior and engagement patterns.',
    author: 'Rachel Green',
    date: '2024-01-01',
    readTime: '6 min read',
    category: 'Psychology',
    image: '/api/placeholder/400/250',
    slug: 'psychology-ai-generated-content'
  }
]

const categories = [
  { name: 'All Posts', count: 24, icon: Tag },
  { name: 'AI Trends', count: 8, icon: TrendingUp },
  { name: 'Content Marketing', count: 6, icon: Brain },
  { name: 'SEO', count: 5, icon: Target },
  { name: 'Social Media', count: 3, icon: Zap },
  { name: 'Chatbots', count: 2, icon: Brain }
]

const resources = [
  {
    title: 'AI Marketing Checklist',
    description: 'A comprehensive checklist to help you implement AI marketing strategies effectively.',
    type: 'PDF Guide',
    downloadUrl: '#'
  },
  {
    title: 'Content Calendar Template',
    description: 'Free template for planning and organizing your AI-generated content.',
    type: 'Template',
    downloadUrl: '#'
  },
  {
    title: 'SEO Audit Worksheet',
    description: 'Step-by-step worksheet for conducting AI-powered SEO audits.',
    type: 'Worksheet',
    downloadUrl: '#'
  },
  {
    title: 'ROI Calculator',
    description: 'Calculate the potential ROI of implementing AI marketing tools.',
    type: 'Tool',
    downloadUrl: '#'
  }
]

export default function BlogPage() {
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
              AI Marketing
              <span className="text-blue-600"> Insights</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Stay ahead of the curve with the latest AI marketing trends, strategies, and best practices from industry experts.
            </p>
          </div>
        </div>
      </div>

      {/* Featured Post */}
      <div className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured Article</h2>
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
              <div className="aspect-video bg-gradient-to-r from-blue-600 to-purple-600"></div>
              <div className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                    {featuredPost.category}
                  </span>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(featuredPost.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {featuredPost.readTime}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{featuredPost.title}</h3>
                <p className="text-gray-600 mb-6">{featuredPost.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-300"></div>
                    <span className="ml-3 text-sm font-medium text-gray-900">{featuredPost.author}</span>
                  </div>
                  <Button href={`/blog/${featuredPost.slug}`}>
                    Read More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-8">
                {/* Social Scraper CTA */}
                <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-pink-500 rounded-lg p-6 text-white shadow-xl">
                  <h3 className="text-lg font-bold mb-2">🚀 Social Media Scraper</h3>
                  <p className="text-sm text-white/90 mb-4">
                    Automate social media engagement on Facebook, LinkedIn, Twitter & Reddit with AI-powered replies!
                  </p>
                  <Button 
                    href="/social-scraper"
                    className="w-full bg-white text-purple-600 hover:bg-gray-100 font-semibold"
                  >
                    Try Now →
                  </Button>
                </div>

                {/* Categories */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
                  <nav className="space-y-2">
                    {categories.map((category, index) => (
                      <Link
                        key={index}
                        href={`/blog/category/${category.name.toLowerCase().replace(' ', '-')}`}
                        className="flex items-center justify-between px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                      >
                        <div className="flex items-center">
                          <category.icon className="h-4 w-4 mr-2" />
                          {category.name}
                        </div>
                        <span className="text-xs text-gray-400">{category.count}</span>
                      </Link>
                    ))}
                  </nav>
                </div>

                {/* Resources */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Free Resources</h3>
                  <div className="space-y-3">
                    {resources.map((resource, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">{resource.title}</h4>
                        <p className="text-xs text-gray-600 mb-2">{resource.description}</p>
                        <Link 
                          href={resource.downloadUrl}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Download {resource.type}
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Newsletter Signup */}
                <div className="p-6 bg-blue-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Stay Updated</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Get the latest AI marketing insights delivered to your inbox.
                  </p>
                  <div className="space-y-3">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button size="sm" className="w-full">
                      Subscribe
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Blog Posts */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {blogPosts.map((post, index) => (
                  <article key={index} className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
                    <div className="aspect-video bg-gradient-to-r from-gray-400 to-gray-600"></div>
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-3">
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                          {post.category}
                        </span>
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(post.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {post.readTime}
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">{post.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-6 w-6 rounded-full bg-gray-300"></div>
                          <span className="ml-2 text-xs font-medium text-gray-900">{post.author}</span>
                        </div>
                        <Button size="sm" variant="ghost" href={`/blog/${post.slug}`}>
                          Read
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Load More */}
              <div className="mt-12 text-center">
                <Button variant="outline" href="/blog/page/2">
                  Load More Articles
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to implement AI marketing?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100">
              Transform your marketing with our AI-powered solutions. Get started with a free consultation.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" variant="secondary" href="/contact">
                Get Free Consultation
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
