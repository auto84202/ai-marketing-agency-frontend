'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Send,
  CheckCircle,
  Calendar,
  Target,
  Users,
  Award,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'

const contactInfo = [
  {
    icon: Mail,
    title: 'Email Us',
    description: 'Send us an email anytime',
    contact: 'aimarketingagencyhelp@gmail.com',
    href: 'mailto:aimarketingagencyhelp@gmail.com',
  },
  {
    icon: Phone,
    title: 'Call Us',
    description: 'Mon-Fri from 8am to 5pm',
    contact: '+1 (555) 123-4567',
    href: 'tel:+15551234567',
  },
  {
    icon: MapPin,
    title: 'Visit Us',
    description: 'Come say hello at our office',
    contact: 'San Francisco, CA',
    href: '#',
  },
  {
    icon: Clock,
    title: 'Response Time',
    description: 'We typically reply within',
    contact: '24 hours',
    href: '#',
  }
]

const services = [
  { value: 'ai-content', label: 'AI Content Generation' },
  { value: 'seo-optimization', label: 'SEO & Ads Optimization' },
  { value: 'social-media', label: 'Social Media Automation' },
  { value: 'ai-chatbots', label: 'AI Chatbots' },
  { value: 'predictive-analytics', label: 'Predictive Analytics' },
  { value: 'budget-optimization', label: 'Budget Optimization' },
  { value: 'ab-testing', label: 'A/B Testing' },
  { value: 'custom-solutions', label: 'Custom AI Solutions' }
]

const budgetRanges = [
  { value: 'under-5k', label: 'Under $5,000', description: 'Starter Package' },
  { value: '5k-10k', label: '$5,000 - $10,000', description: 'Growth Package' },
  { value: '10k-25k', label: '$10,000 - $25,000', description: 'Professional Package' },
  { value: '25k-50k', label: '$25,000 - $50,000', description: 'Enterprise Package' },
  { value: '50k-100k', label: '$50,000 - $100,000', description: 'Premium Package' },
  { value: 'over-100k', label: 'Over $100,000', description: 'Custom Enterprise' }
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    service: '',
    budget: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/clients/lead`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          company: formData.company || undefined,
          phone: formData.phone || undefined,
          message: formData.message,
          budget: formData.budget || undefined,
          industry: formData.service || undefined,
        }),
      })
      
      if (response.ok) {
        setIsSubmitted(true)
        setFormData({
          name: '',
          email: '',
          company: '',
          phone: '',
          service: '',
          budget: '',
          message: ''
        })
      } else {
        const errorData = await response.json().catch(() => ({}))
        alert(errorData.message || 'Failed to submit form. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Network error. Please make sure the backend is running.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <div className="mx-auto max-w-2xl py-32 px-6">
          <div className="bg-white rounded-2xl shadow-xl p-12 border border-gray-200 text-center">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Message Sent Successfully
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Thank you for reaching out! We&apos;ll get back to you within 24 hours.
            </p>
            
            <div className="flex gap-4 justify-center">
              <Button href="/" className="bg-indigo-600 hover:bg-indigo-700">
                Back to Home
              </Button>
              <Button 
                onClick={() => setIsSubmitted(false)}
                variant="outline"
                className="border-gray-300 hover:border-gray-400"
              >
                Send Another Message
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      {/* Hero Section */}
      <div className="relative px-6 pt-20 lg:px-8">
        <div className="mx-auto max-w-3xl py-20 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-4">
            Get In <span className="text-indigo-600">Touch</span>
          </h1>
          <p className="text-lg text-gray-600">
            Ready to transform your marketing with AI? Let&apos;s discuss your goals and create a custom solution.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-10 max-w-2xl mx-auto">
            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
              <Target className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">300%</div>
              <div className="text-xs text-gray-600">Avg ROI Increase</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
              <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">500+</div>
              <div className="text-xs text-gray-600">Happy Clients</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
              <Award className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">24/7</div>
              <div className="text-xs text-gray-600">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Cards */}
      <div className="py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {contactInfo.map((info, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all text-center"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 mb-4">
                  <info.icon className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">{info.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{info.description}</p>
                <Link 
                  href={info.href} 
                  className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm"
                >
                  {info.contact}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <Send className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Send us a message</h2>
                    <p className="text-sm text-gray-600">We&apos;ll respond within 24 hours</p>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name and Email */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                        Full Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="block w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-gray-900 placeholder-gray-400 font-medium"
                        style={{ color: '#111827' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                        Email Address <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@company.com"
                        className="block w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-gray-900 placeholder-gray-400 font-medium"
                        style={{ color: '#111827' }}
                      />
                    </div>
                  </div>
                  
                  {/* Company and Phone */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="company" className="block text-sm font-semibold text-gray-900 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        name="company"
                        id="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Your Company"
                        className="block w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-gray-900 placeholder-gray-400 font-medium"
                        style={{ color: '#111827' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 000-0000"
                        className="block w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-gray-900 placeholder-gray-400 font-medium"
                        style={{ color: '#111827' }}
                      />
                    </div>
                  </div>
                  
                  {/* Service and Budget */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="service" className="block text-sm font-semibold text-gray-900 mb-2">
                        Service Interested In
                      </label>
                      <select
                        name="service"
                        id="service"
                        value={formData.service}
                        onChange={handleChange}
                        className="block w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all cursor-pointer font-medium text-gray-900 hover:border-gray-400"
                        style={{ color: '#111827' }}
                      >
                        <option value="" className="text-gray-500">Select a service</option>
                        {services.map((service) => (
                          <option key={service.value} value={service.value} className="text-gray-900 font-medium">
                            {service.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="budget" className="block text-sm font-semibold text-gray-900 mb-2">
                        Budget Range
                      </label>
                      <select
                        name="budget"
                        id="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        className="block w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all cursor-pointer font-medium text-gray-900 hover:border-gray-400"
                        style={{ color: '#111827' }}
                      >
                        <option value="" className="text-gray-500">Select budget range</option>
                        {budgetRanges.map((range) => (
                          <option key={range.value} value={range.value} className="text-gray-900 font-medium">
                            {range.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-2">
                      Your Message <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      name="message"
                      id="message"
                      rows={6}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      maxLength={1000}
                      placeholder="Tell us about your project, goals, and how we can help you achieve success..."
                      className="block w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-gray-900 placeholder-gray-400 resize-none font-medium"
                      style={{ color: '#111827' }}
                    />
                    <div className="mt-2 flex justify-between items-center">
                      <p className="text-xs text-gray-600">Be as detailed as possible</p>
                      <span className="text-xs font-semibold text-gray-500">{formData.message.length} / 1000</span>
                    </div>
                  </div>
                  
                  {/* Submit Button */}
                  <button
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-lg py-4 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Secure & encrypted connection</span>
                  </div>
                </form>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Why Choose Us */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Why Choose Us?</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">300% average ROI increase</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">AI-powered automation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">Custom tailored solutions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">24/7 dedicated support</span>
                  </li>
                </ul>
              </div>
              
              {/* CTA Card */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
                <Calendar className="h-8 w-8 mb-3" />
                <h4 className="text-xl font-bold mb-2">Ready to Start?</h4>
                <p className="text-white/90 mb-4 text-sm">
                  Book a free consultation and discover how AI can transform your marketing.
                </p>
                <Link 
                  href="/pricing"
                  className="block w-full bg-white text-indigo-600 font-semibold text-center py-3 rounded-lg hover:bg-gray-50 transition-all"
                >
                  View Pricing Plans
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
