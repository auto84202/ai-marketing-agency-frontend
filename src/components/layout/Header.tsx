'use client'

import { useState, useEffect } from 'react'
import { AuthService } from '@/lib/auth'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Menu, X, User, LogOut, CheckCircle } from 'lucide-react'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Services', href: '/services' },
  { name: 'Portfolio', href: '/portfolio' },
  { name: 'AI Images', href: '/ai-images' },
  { name: 'Chatbot', href: '/chatbot' },
  { name: 'Social Scraper', href: '/social-scraper' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contact', href: '/contact' },
]

// Group navigation for better organization
const primaryNav = [
  { name: 'Home', href: '/' },
  { name: 'Services', href: '/services' },
  { name: 'Portfolio', href: '/portfolio' },
  { name: 'Pricing', href: '/pricing' },
]

const secondaryNav = [
  { name: 'AI Images', href: '/ai-images' },
  { name: 'Chatbot', href: '/chatbot' },
  { name: 'Social Scraper', href: '/social-scraper' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contact', href: '/contact' },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userName, setUserName] = useState('')
  const pathname = usePathname()
  
  useEffect(() => {
    checkAuth()
    
    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = () => {
      checkAuth()
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token')
    const user = localStorage.getItem('user')
    
    if (token) {
      setIsAuthenticated(true)
      if (user) {
        try {
          const userData = JSON.parse(user)
          setUserName(userData.name || userData.email)
        } catch (e) {
          setUserName('User')
        }
      }
    } else {
      setIsAuthenticated(false)
      setUserName('')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setUserName('')
    window.location.href = '/auth/login'
  }

  return (
    <header className="bg-gradient-header shadow-sm sticky top-0 z-50 w-full overflow-x-hidden">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8 w-full" aria-label="Global">
        {/* Logo Section */}
        <div className="flex items-center flex-shrink-0 min-w-0">
          <Link href="/" className="flex items-center space-x-2 xl:space-x-3 group min-w-0">
            <img 
              src="/logo.png" 
              alt="AI Marketing Pro Logo" 
              className="h-8 w-8 xl:h-10 xl:w-10 object-contain flex-shrink-0"
              onError={(e) => {
                // Fallback to text logo if image doesn't exist
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="h-8 w-8 xl:h-10 xl:w-10 bg-primary-light-purple rounded flex items-center justify-center flex-shrink-0" style={{ display: 'none' }}>
              <span className="text-white font-bold text-xs xl:text-sm">AI</span>
            </div>
            <span className="text-lg xl:text-xl font-bold text-white tracking-tight whitespace-nowrap">MarketPro</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-white/10 transition-colors"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:items-center lg:justify-center lg:flex-1 lg:mx-4 xl:mx-8 min-w-0">
          <nav className="flex items-center justify-center space-x-3 xl:space-x-4 2xl:space-x-6 flex-wrap gap-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-xs xl:text-sm font-semibold leading-6 px-2 xl:px-3 py-2 transition-all duration-200 relative whitespace-nowrap flex-shrink-0 ${
                    isActive 
                      ? 'text-primary-pink' 
                      : 'text-white hover:text-primary-light-purple'
                  }`}
                >
                  {item.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-pink rounded-full"></span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden lg:flex lg:items-center lg:justify-end lg:flex-shrink-0 lg:space-x-2 xl:space-x-4">
          {isAuthenticated ? (
            <div className="flex items-center space-x-2 xl:space-x-3 flex-shrink-0">
              <div className="flex items-center gap-1.5 xl:gap-2 px-2 xl:px-3 py-1.5 bg-green-500/20 rounded-lg border border-green-400/30">
                <CheckCircle className="h-3.5 xl:h-4 w-3.5 xl:w-4 text-green-400 flex-shrink-0" />
                <span className="text-xs xl:text-sm font-semibold text-white whitespace-nowrap max-w-[100px] xl:max-w-none truncate">{userName}</span>
              </div>
              <Button 
                variant="ghost" 
                href="/dashboard" 
                className="text-white hover:text-primary-light-purple px-2 xl:px-4 py-2 text-xs xl:text-sm"
              >
                <User className="h-3.5 xl:h-4 w-3.5 xl:w-4 mr-1 xl:mr-2" />
                <span className="hidden xl:inline">Dashboard</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={handleLogout} 
                className="text-white border-white hover:bg-white hover:text-primary-dark px-2 xl:px-4 py-2 text-xs xl:text-sm"
              >
                <LogOut className="h-3.5 xl:h-4 w-3.5 xl:w-4 mr-1 xl:mr-2" />
                <span className="hidden xl:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 xl:space-x-3 flex-shrink-0">
              <Button 
                variant="ghost" 
                href="/auth/login" 
                className="text-white hover:text-primary-light-purple px-2 xl:px-4 py-2 font-semibold text-xs xl:text-sm"
              >
                Log in
              </Button>
              <Button 
                href="/auth/register" 
                className="btn-primary px-4 xl:px-6 py-2 font-semibold whitespace-nowrap text-xs xl:text-sm"
              >
                Get Started
              </Button>
            </div>
          )}
        </div>
      </nav>
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-50" />
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto glass px-6 py-6 sm:max-w-sm">
            <div className="flex items-center justify-between pb-6 border-b border-white/10">
              <Link href="/" className="flex items-center space-x-3" onClick={() => setMobileMenuOpen(false)}>
                <img 
                  src="/logo.png" 
                  alt="AI Marketing Pro Logo" 
                  className="h-10 w-10 object-contain"
                  onError={(e) => {
                    // Fallback to text logo if image doesn't exist
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="h-10 w-10 bg-primary-light-purple rounded flex items-center justify-center" style={{ display: 'none' }}>
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <span className="text-xl font-bold text-white tracking-tight">MarketPro</span>
              </Link>
              <button
                type="button"
                className="rounded-md p-2 text-white hover:bg-white/10 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-8 flow-root">
              <div className="divide-y divide-white/10">
                {/* Mobile Navigation Links */}
                <div className="space-y-1 py-6">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`block rounded-lg px-4 py-3 text-base font-semibold leading-6 transition-colors ${
                          isActive
                            ? 'bg-primary-pink/20 text-primary-pink'
                            : 'text-white hover:bg-white/10'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
                
                {/* Mobile Auth Buttons */}
                <div className="py-6 space-y-3">
                  {isAuthenticated ? (
                    <>
                      <div className="flex items-center gap-2 px-4 py-3 bg-green-500/20 rounded-lg border border-green-400/30 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                        <span className="text-sm font-semibold text-white">{userName}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-white hover:text-primary-light-purple px-4 py-3" 
                        href="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Dashboard
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-white border-white hover:bg-white hover:text-primary-dark px-4 py-3" 
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleLogout();
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="ghost" 
                        className="w-full text-white hover:text-primary-light-purple px-4 py-3 font-semibold" 
                        href="/auth/login"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Log in
                      </Button>
                      <Button 
                        className="w-full btn-primary px-4 py-3 font-semibold" 
                        href="/auth/register"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Get Started
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
