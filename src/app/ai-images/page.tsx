'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { 
  ImageIcon, 
  Wand2, 
  Download, 
  Copy, 
  RefreshCw,
  Palette,
  Target,
  Info,
  CheckCircle,
  AlertCircle,
  Lock,
  LogIn
} from 'lucide-react';

interface ImageGenerationResult {
  images: Array<{
    url?: string;
    b64_json?: string;
    revised_prompt?: string;
  }>;
  tokensUsed: number;
  cost: number;
  metadata: {
    model: string;
    size: string;
    quality: string;
    style: string;
    prompt: string;
    generatedAt: string;
  };
}

const useCases = [
  { id: 'social_media', name: 'Social Media', icon: '📱' },
  { id: 'ad_banner', name: 'Ad Banner', icon: '📢' },
  { id: 'product_mockup', name: 'Product', icon: '📦' },
  { id: 'blog_header', name: 'Blog Header', icon: '📝' },
  { id: 'email_banner', name: 'Email', icon: '📧' },
  { id: 'logo', name: 'Logo', icon: '🎯' },
];

const styles = [
  { id: 'minimalist', name: 'Minimalist', icon: '⚪' },
  { id: 'vintage', name: 'Vintage', icon: '📺' },
  { id: 'modern', name: 'Modern', icon: '✨' },
  { id: 'corporate', name: 'Corporate', icon: '💼' },
  { id: 'creative', name: 'Creative', icon: '🎨' },
  { id: 'photorealistic', name: 'Photo', icon: '📸' },
];

const sizes = [
  { id: '1024x1024', name: 'Square (1024×1024)', description: 'Social posts, profile images' },
  { id: '1792x1024', name: 'Landscape (1792×1024)', description: 'Banners, headers, covers' },
  { id: '1024x1792', name: 'Portrait (1024×1792)', description: 'Mobile, stories, posters' },
];

export default function AIImagesPage() {
  const [prompt, setPrompt] = useState('');
  const [selectedUseCase, setSelectedUseCase] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [selectedSize, setSelectedSize] = useState('1024x1024');
  const [quality, setQuality] = useState('standard');
  const [imageCount, setImageCount] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<ImageGenerationResult | null>(null);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Check authentication on mount and whenever page becomes visible
    const checkAuth = () => {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      const user = localStorage.getItem('user');
      
      console.log('Auth check - Token:', token ? 'Found' : 'Not found');
      console.log('Auth check - User:', user ? 'Found' : 'Not found');
      
      setIsAuthenticated(!!token);
      setIsCheckingAuth(false);
    };

    checkAuth();

    // Listen for storage changes (login in another tab)
    const handleStorageChange = () => {
      console.log('Storage changed, rechecking auth...');
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', checkAuth);
    
    // Also check on visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page became visible, rechecking auth...');
        checkAuth();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', checkAuth);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt to generate your image');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Please login first to generate images');
      }

      console.log('Generating image with token:', token ? 'Token found' : 'No token');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/images/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt,
          size: selectedSize,
          quality,
          style: 'vivid',
          n: Math.min(Math.max(imageCount, 1), 10), // Limit between 1-10
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        console.error('Error status:', response.status);
        console.error('Error statusText:', response.statusText);
        
        if (response.status === 401) {
          // Token might be expired, clear it
          localStorage.removeItem('token');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(errorData.message || `Failed to generate image (${response.status}). Please try again.`);
      }

      const data = await response.json();
      console.log('Image generation successful:', data);
      console.log('Images array:', data.images);
      console.log('Number of images:', data.images?.length);
      
      if (data.images && data.images.length > 0) {
        console.log('First image URL:', data.images[0].url);
        console.log('Image URL type:', typeof data.images[0].url);
        console.log('Image URL accessible:', data.images[0].url ? 'Yes' : 'No');
        
        // Check if using mock images
        if (data.images[0].url?.includes('picsum.photos')) {
          console.warn('⚠️ Using mock images from picsum.photos');
          console.warn('This suggests the OpenAI API call failed. Check backend logs for details.');
        }
      }
      setResult(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate image';
      console.error('Generation error:', msg);
      setError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMarketingImage = async () => {
    if (!selectedUseCase || !prompt.trim()) {
      setError('Please select a use case and enter a description');
      return;
    }
    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/images/generate/marketing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          useCase: selectedUseCase,
          description: prompt,
          size: selectedSize,
          quality,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate marketing image');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate marketing image');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateStyledImage = async () => {
    if (!selectedStyle || !prompt.trim()) {
      setError('Please select a style and enter a prompt');
      return;
    }
    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/images/generate/styled`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          prompt,
          style: selectedStyle,
          size: selectedSize,
          quality,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate styled image');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate styled image');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async (url: string, filename: string) => {
    try {
      // Use our backend proxy to download the image (bypasses CORS)
      const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL}/ai/images/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename || 'generated-image.png')}`;
      
      // Create and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'generated-image.png';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);
      
      console.log('✅ Download initiated');
    } catch (error) {
      console.error('Download failed:', error);
      alert('❌ Download failed. Please try again or right-click the image and select "Save image as..."');
    }
  };

  const copyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Show login prompt if not authenticated
  if (!isCheckingAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Header />
        <div className="container mx-auto px-4 py-20 max-w-4xl">
          <div className="bg-white rounded-2xl shadow-xl border-2 border-indigo-200 p-12 text-center">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 mb-6">
              <Lock className="h-10 w-10 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Authentication Required</h1>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              Please login to access AI image generation and create stunning visuals for your marketing campaigns.
            </p>
            <div className="flex gap-4 justify-center">
              <Link 
                href="/auth/login?redirect=/ai-images"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold px-8 py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                <LogIn className="h-5 w-5" />
                Login Now
              </Link>
              <Link 
                href="/auth/register?redirect=/ai-images"
                className="inline-flex items-center gap-2 bg-white text-gray-900 font-semibold px-8 py-4 rounded-xl border-2 border-gray-300 hover:border-gray-400 transition-all shadow-md hover:shadow-lg"
              >
                Create Account
              </Link>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              New user? <Link href="/auth/register?redirect=/ai-images" className="text-indigo-600 hover:text-indigo-700 font-semibold">Create a free account</Link>
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      
      {/* Login Status Banner - Professional Green Design */}
      {isAuthenticated && (
        <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 border-b border-green-200 shadow-sm">
          <div className="container mx-auto px-4 py-4 max-w-7xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center ring-2 ring-green-300 shadow-md">
                  <svg 
                    className="h-6 w-6 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    strokeWidth="3"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-green-900 tracking-wide">
                    ✓ Authenticated & Ready
                  </span>
                  <span className="text-xs text-green-700">
                    You can now generate unlimited AI images
                  </span>
                </div>
              </div>
              <Link 
                href="/dashboard" 
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Clean Professional Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
              <ImageIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">AI Image Generation</h1>
              <p className="text-sm text-gray-600 font-medium">Powered by DALL·E 3</p>
            </div>
          </div>
          <p className="text-lg text-gray-700 max-w-3xl">
            Create professional visuals for your marketing campaigns. Generate logos, banners, social media content, and more with AI.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Wand2 className="h-6 w-6 text-indigo-600" />
                Create Your Image
              </h2>

              {/* Prompt */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Describe Your Image <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Example: A modern minimalist logo for a tech startup, clean lines, blue and white colors, professional, high quality..."
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none font-medium text-gray-900 placeholder-gray-400"
                  rows={5}
                  maxLength={1000}
                  style={{ color: '#111827' }}
                />
                <div className="mt-2 flex justify-between items-center">
                  <p className="text-xs text-gray-600">Be specific for best results</p>
                  <span className="text-xs font-semibold text-gray-500">{prompt.length} / 1000</span>
                </div>
              </div>

              {/* Size & Quality Grid */}
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Number of Images <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={imageCount}
                    onChange={(e) => setImageCount(Math.min(Math.max(parseInt(e.target.value) || 1, 1), 10))}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all font-medium text-gray-900"
                    style={{ color: '#111827' }}
                  />
                  <p className="mt-1 text-xs text-gray-600">
                    Select 1-10 images (cost increases per image)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Image Size
                  </label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all cursor-pointer font-medium text-gray-900 hover:border-gray-400"
                    style={{ color: '#111827' }}
                  >
                    {sizes.map((size) => (
                      <option key={size.id} value={size.id} className="font-medium text-gray-900">
                        {size.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-600">{sizes.find(s => s.id === selectedSize)?.description}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Quality
                  </label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all cursor-pointer font-medium text-gray-900 hover:border-gray-400"
                    style={{ color: '#111827' }}
                  >
                    <option value="standard" className="font-medium">Standard Quality</option>
                    <option value="hd" className="font-medium">HD Quality (+2x cost)</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-600">
                    {quality === 'hd' ? 'Ultra-sharp, detailed images' : 'Fast & economical'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={generateImage}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-lg py-4 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-5 w-5" />
                      <span>Generate Image</span>
                    </>
                  )}
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={generateMarketingImage}
                    disabled={isGenerating || !selectedUseCase || !prompt.trim()}
                    className="bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  >
                    <Target className="h-4 w-4" />
                    <span>Marketing</span>
                  </button>

                  <button
                    onClick={generateStyledImage}
                    disabled={isGenerating || !selectedStyle || !prompt.trim()}
                    className="bg-emerald-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  >
                    <Palette className="h-4 w-4" />
                    <span>Styled</span>
                  </button>
                </div>
              </div>

              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
                  <div className="flex items-start gap-3 mb-3">
                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <span className="font-medium">{error}</span>
                  </div>
                  {error.includes('login') && (
                    <a 
                      href="/auth/login" 
                      className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all text-sm"
                    >
                      Login Now
                    </a>
                  )}
                </div>
              )}
              
              {/* Helper Info */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900 font-medium mb-2">
                  💡 <strong>Tip:</strong> Make sure you&apos;re logged in to generate images
                </p>
                <p className="text-xs text-blue-800">
                  New user? <a href="/auth/register" className="underline font-semibold hover:text-blue-600">Create an account</a> | 
                  Already have one? <a href="/auth/login" className="underline font-semibold hover:text-blue-600">Login here</a>
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Use Cases */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-600" />
                Marketing Use Cases
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {useCases.map((useCase) => (
                  <button
                    key={useCase.id}
                    onClick={() => setSelectedUseCase(useCase.id)}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      selectedUseCase === useCase.id
                        ? 'border-indigo-600 bg-indigo-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-2xl mb-1">{useCase.icon}</div>
                    <div className="text-xs font-semibold text-gray-900">{useCase.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Styles */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Palette className="h-5 w-5 text-purple-600" />
                Art Styles
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {styles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      selectedStyle === style.id
                        ? 'border-purple-600 bg-purple-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-2xl mb-1">{style.icon}</div>
                    <div className="text-xs font-semibold text-gray-900">{style.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Info className="h-5 w-5 text-gray-600" />
                Pricing
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700 font-medium">1024×1024 (Standard)</span>
                  <span className="font-bold text-gray-900">$0.04</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700 font-medium">1024×1024 (HD)</span>
                  <span className="font-bold text-gray-900">$0.08</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700 font-medium">1792×1024 (Standard)</span>
                  <span className="font-bold text-gray-900">$0.08</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700 font-medium">1792×1024 (HD)</span>
                  <span className="font-bold text-gray-900">$0.12</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                <p className="text-xs font-semibold text-indigo-900 mb-1">
                  Estimated Cost for {imageCount} {imageCount === 1 ? 'image' : 'images'}:
                </p>
                <p className="text-lg font-bold text-indigo-900">
                  ${(() => {
                    let costPerImage = 0.04;
                    if (selectedSize === '1792x1024' || selectedSize === '1024x1792') {
                      costPerImage = quality === 'hd' ? 0.12 : 0.08;
                    } else if (quality === 'hd') {
                      costPerImage = 0.08;
                    }
                    return (costPerImage * imageCount).toFixed(2);
                  })()}
                </p>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs font-medium text-blue-900">
                  💡 HD quality provides 2× sharper and more detailed images
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="mt-12">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-600 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Generated Images</h3>
                    <p className="text-sm text-gray-600">High-quality AI artwork</p>
                  </div>
                </div>
                
                <div className="flex gap-3 text-sm">
                  <div className="px-4 py-2 bg-gray-100 rounded-lg border border-gray-200">
                    <span className="text-gray-600">Cost: </span>
                    <span className="font-bold text-gray-900">${result.cost.toFixed(4)}</span>
                  </div>
                  <div className="px-4 py-2 bg-gray-100 rounded-lg border border-gray-200">
                    <span className="text-gray-600">Tokens: </span>
                    <span className="font-bold text-gray-900">{result.tokensUsed}</span>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {result.images.map((image, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all">
                    <div className="aspect-square bg-gray-200 rounded-lg mb-4 overflow-hidden">
                      {image.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={image.url}
                          alt={`Generated ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onLoad={() => console.log(`Image ${index + 1} loaded successfully`)}
                          onError={(e) => {
                            console.error(`Image ${index + 1} failed to load:`, e);
                            console.error('Image URL:', image.url);
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-16 w-16 text-gray-400" />
                          <div className="text-xs text-gray-500 mt-2">No image URL</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => downloadImage(image.url!, `ai-image-${Date.now()}.png`)}
                          className="bg-indigo-600 text-white py-2.5 px-3 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all flex items-center justify-center gap-1.5"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </button>
                        <button
                          onClick={() => copyPrompt(result.metadata.prompt)}
                          className="bg-gray-600 text-white py-2.5 px-3 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-all flex items-center justify-center gap-1.5"
                        >
                          <Copy className="h-4 w-4" />
                          Copy
                        </button>
                      </div>

                      {image.revised_prompt && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-xs font-semibold text-gray-700 mb-1">AI Enhanced Prompt:</p>
                          <p className="text-xs text-gray-600">{image.revised_prompt}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Metadata */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="grid md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 font-medium">Model</p>
                    <p className="font-bold text-gray-900">{result.metadata.model}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Size</p>
                    <p className="font-bold text-gray-900">{result.metadata.size}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Quality</p>
                    <p className="font-bold text-gray-900">{result.metadata.quality.toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Generated</p>
                    <p className="font-bold text-gray-900">{new Date(result.metadata.generatedAt).toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
