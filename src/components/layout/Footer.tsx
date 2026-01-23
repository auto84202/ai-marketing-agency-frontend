import Link from 'next/link'
import { Zap, Mail, Phone, MapPin } from 'lucide-react'

const navigation = {
  services: [
    { name: 'AI Content Generation', href: '/services#content' },
    { name: 'SEO Optimization', href: '/services#seo' },
    { name: 'Social Media Marketing', href: '/services#social' },
    { name: 'AI Chatbots', href: '/services#chatbot' },
  ],
  company: [
    { name: 'About', href: '/about' },
    { name: 'Portfolio', href: '/portfolio' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Contact', href: '/contact' },
  ],
  resources: [
    { name: 'Blog', href: '/blog' },
    { name: 'Case Studies', href: '/portfolio' },
    { name: 'Documentation', href: '/docs' },
    { name: 'Support', href: '/support' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-gradient-header" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-primary-light-purple rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="ml-2 text-xl font-bold text-white">MarketPro</span>
            </div>
            <p className="text-sm leading-6 text-text-secondary">
              Revolutionary AI marketing solutions for modern businesses.
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-text-secondary">
                <Mail className="h-4 w-4 mr-2" />
                <span>aimarketingagencyhelp@gmail.com</span>
              </div>
              <div className="flex items-center text-sm text-text-secondary">
                <Phone className="h-4 w-4 mr-2" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center text-sm text-text-secondary">
                <MapPin className="h-4 w-4 mr-2" />
                <span>LinkedIn</span>
              </div>
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">Services</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.services.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm leading-6 text-text-secondary hover:text-white">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white">Company</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.company.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm leading-6 text-text-secondary hover:text-white">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-1 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">Connect</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.resources.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm leading-6 text-text-secondary hover:text-white">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-white/10 pt-8 sm:mt-20 lg:mt-24">
          <p className="text-xs leading-5 text-text-muted">
            &copy; 2024 AI MarketPro. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
