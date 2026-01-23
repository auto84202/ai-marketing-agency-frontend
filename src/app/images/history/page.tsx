'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Button } from '@/components/ui/Button'
import { Download, Image as ImageIcon, Calendar, Eye, X, RefreshCw, Sparkles } from 'lucide-react'

interface ImageHistory {
  id: string
  title?: string
  content: string
  metadata?: {
    imageUrl?: string
    imageType?: string
    source?: string
    revisedPrompt?: string
  }
  campaign?: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

export default function ImageHistoryPage() {
  const router = useRouter()
  const [images, setImages] = useState<ImageHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const fetchImages = async () => {
    try {
      setLoading(true)
      setError('')
      
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
      if (!token) {
        router.push('/auth/login')
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      const response = await fetch(`${apiUrl}/ai/content?type=IMAGE&limit=1000`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        let errorMessage = 'Failed to fetch images'
        try {
          const errorData = await response.json()
          errorMessage = errorData?.message || errorMessage
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      // Handle different response formats
      let imagesData = []
      if (data?.success && data?.data?.content) {
        imagesData = data.data.content
      } else if (data?.data?.content) {
        imagesData = data.data.content
      } else if (data?.content) {
        imagesData = data.content
      } else if (Array.isArray(data)) {
        imagesData = data
      } else if (data?.data && Array.isArray(data.data)) {
        imagesData = data.data
      }
      
      setImages(Array.isArray(imagesData) ? imagesData : [])
    } catch (error) {
      console.error('Error fetching images:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to load images'
      setError(errorMessage)
      
      // If unauthorized, redirect to login
      if (errorMessage.includes('401') || errorMessage.includes('403') || errorMessage.includes('Unauthorized')) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('token')
        router.push('/auth/login')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchImages()
  }, [])

  const handleDownloadImage = async (url: string, filename: string) => {
    try {
      // Ensure URL is properly formatted
      let imageUrl = url
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      if (!imageUrl.startsWith('http')) {
        // If it's a relative URL, prepend the backend URL
        imageUrl = `${apiUrl}${imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl}`
      }

      // Use the backend proxy endpoint (no auth required according to backend comment)
      const downloadUrl = `${apiUrl}/ai/images/download?url=${encodeURIComponent(imageUrl)}&filename=${encodeURIComponent(filename || 'generated-image.png')}`
      
      console.log('Downloading image:', { originalUrl: url, formattedUrl: imageUrl, filename, downloadUrl })
      
      // Fetch through backend proxy
      const response = await fetch(downloadUrl, {
        method: 'GET',
        // Note: Backend controller doesn't require auth, but we'll try with token if available
      })
      
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = `Failed to download image: ${response.status} ${response.statusText}`
        let errorDetails = ''
        
        try {
          const errorData = await response.text()
          if (errorData) {
            try {
              const parsed = JSON.parse(errorData)
              errorMessage = parsed.message || errorMessage
              errorDetails = parsed.error || ''
            } catch {
              // If not JSON, use the text as error message (but truncate if too long)
              const truncatedError = errorData.length > 500 ? errorData.substring(0, 500) + '...' : errorData
              errorMessage = truncatedError || errorMessage
            }
          }
        } catch (parseError) {
          // Ignore parsing errors, use default error message
          console.warn('Failed to parse error response:', parseError)
        }
        
        // Provide user-friendly error message based on status
        if (response.status === 403 || errorMessage.includes('expired')) {
          errorMessage = 'Image URL has expired. OpenAI DALL-E image URLs are temporary and expire after some time. This image can no longer be downloaded. Please generate a new image.'
        } else if (response.status === 404) {
          errorMessage = 'Image not found. The image may have been deleted or the URL is invalid.'
        } else if (response.status === 410) {
          errorMessage = 'Image URL has expired or been removed. Please generate a new image.'
        }
        
        console.error('Download error:', { 
          status: response.status, 
          statusText: response.statusText, 
          errorMessage,
          originalUrl: url,
          formattedUrl: imageUrl,
          downloadUrl
        })
        
        throw new Error(errorMessage)
      }
      
      const blob = await response.blob()
      
      if (!blob || blob.size === 0) {
        throw new Error('Downloaded file is empty')
      }
      
      const blobUrl = window.URL.createObjectURL(blob)
      
      // Create download link
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename || 'generated-image.png'
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link)
        }
        window.URL.revokeObjectURL(blobUrl)
      }, 100)
      
      console.log('✅ Image downloaded successfully')
    } catch (error) {
      console.error('Download failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      
      // Try fallback: direct download if URL is accessible
      try {
        const link = document.createElement('a')
        link.href = url
        link.download = filename || 'generated-image.png'
        link.target = '_blank'
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        
        setTimeout(() => {
          if (document.body.contains(link)) {
            document.body.removeChild(link)
          }
        }, 100)
        
        alert(`Backend download failed: ${errorMessage}\n\nAttempting direct download...`)
      } catch (fallbackError) {
        // Last resort: open in new tab
        window.open(url, '_blank')
        alert(`Download failed: ${errorMessage}\n\nImage opened in new tab. Right-click and select "Save image as..." to download.`)
      }
    }
  }

  const getImageUrl = (image: ImageHistory) => {
    return image.metadata?.imageUrl || image.content
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-center">
          <ImageIcon className="h-12 w-12 text-primary-light-purple mx-auto mb-4 animate-pulse" />
          <p className="text-text-secondary">Loading image history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Header />
      
      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <Breadcrumb items={[{ label: 'Image History' }]} />
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Image History</h1>
            <p className="text-text-secondary">Browse and download all your generated images</p>
          </div>
          <Button
            onClick={fetchImages}
            variant="outline"
            className="text-white border-white/30 hover:bg-white hover:text-primary-dark"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Sparkles className="h-6 w-6 mr-2 text-primary-light-purple" />
              Generated Images
              <span className="ml-3 px-3 py-1 rounded-full text-sm font-medium bg-primary-light-purple/20 text-primary-light-purple">
                {images.length}
              </span>
            </h2>
            <p className="text-text-secondary mt-1">Browse and download all your generated images</p>
          </div>
        </div>

        {images.length === 0 ? (
          <div className="card text-center py-16">
            <ImageIcon className="h-20 w-20 text-primary-light-purple mx-auto mb-6 opacity-50" />
            <h3 className="text-xl font-bold text-white mb-2">No Images Yet</h3>
            <p className="text-text-secondary mb-6">
              Generate images by creating a campaign and deploying a chatbot
            </p>
            <Button
              onClick={() => router.push('/campaigns/create')}
              className="bg-primary-light-purple hover:bg-primary-pink text-white"
            >
              Create Campaign
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((image) => {
              const imageUrl = getImageUrl(image)
              if (!imageUrl) return null

              const imageType = image.metadata?.imageType || 'image'
              const filename = `${image.campaign?.name || 'image'}-${imageType}-${image.id}.png`

              return (
                <div key={image.id} className="card group hover:scale-105 transition-transform">
                  <div className="aspect-video bg-secondary-dark rounded-lg overflow-hidden border border-white/10 mb-3 relative">
                    <img
                      src={imageUrl}
                      alt={image.title || 'Generated image'}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setSelectedImage(imageUrl)}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Eye className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-white line-clamp-1">
                      {image.title || `${imageType.charAt(0).toUpperCase() + imageType.slice(1)} Image`}
                    </h3>
                    {image.campaign && (
                      <p className="text-xs text-primary-light-purple truncate">
                        {image.campaign.name}
                      </p>
                    )}
                    <div className="flex items-center text-xs text-text-secondary">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(image.createdAt).toLocaleDateString()}
                    </div>
                    <Button
                      onClick={() => handleDownloadImage(imageUrl, filename)}
                      variant="outline"
                      size="sm"
                      className="w-full text-white border-white/30 hover:bg-white hover:text-primary-dark"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-[90vh] rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  const image = images.find(img => getImageUrl(img) === selectedImage)
                  if (image) {
                    const imageType = image.metadata?.imageType || 'image'
                    const filename = `${image.campaign?.name || 'image'}-${imageType}-${image.id}.png`
                    handleDownloadImage(selectedImage, filename)
                  }
                }}
                className="bg-white/20 hover:bg-white/30 text-white border-0"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
