import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'

export const metadata: Metadata = {
  title: 'AI Marketing Pro - Transform Your Business with AI-Powered Marketing',
  description: 'Scale your marketing with cutting-edge AI solutions. Content generation, SEO optimization, social media automation, and AI chatbots. Get 300% ROI increase.',
  keywords: 'AI marketing, content generation, SEO optimization, social media marketing, AI chatbots, marketing automation',
  authors: [{ name: 'AI Marketing Pro' }],
  creator: 'AI Marketing Pro',
  publisher: 'AI Marketing Pro',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://aimarketingpro.com',
    title: 'AI Marketing Pro - Transform Your Business with AI-Powered Marketing',
    description: 'Scale your marketing with cutting-edge AI solutions. Content generation, SEO optimization, social media automation, and AI chatbots.',
    siteName: 'AI Marketing Pro',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AI Marketing Pro - AI-Powered Marketing Solutions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Marketing Pro - Transform Your Business with AI-Powered Marketing',
    description: 'Scale your marketing with cutting-edge AI solutions. Content generation, SEO optimization, social media automation, and AI chatbots.',
    images: ['/twitter-image.jpg'],
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>

        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="canonical" href="https://aimarketingpro.com" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans overflow-x-hidden max-w-full">
        <div className="w-full max-w-full overflow-x-hidden">
          <AuthProvider>
            {children}
          </AuthProvider>
        </div>
      </body>
    </html>
  )
}