'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface ConnectionStatus {
  backend: 'checking' | 'connected' | 'error'
  message: string
}

export default function ConnectionTest() {
  const [status, setStatus] = useState<ConnectionStatus>({
    backend: 'checking',
    message: 'Not tested yet'
  })

  const testBackendConnection = async () => {
    setStatus({ backend: 'checking', message: 'Testing backend connection...' })
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setStatus({ 
          backend: 'connected', 
          message: `Backend connected successfully! Response: ${JSON.stringify(data)}` 
        })
      } else {
        setStatus({ 
          backend: 'error', 
          message: `Backend responded with status: ${response.status}` 
        })
      }
    } catch (error) {
      setStatus({ 
        backend: 'error', 
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      })
    }
  }

  const testAuthEndpoint = async () => {
    setStatus({ backend: 'checking', message: 'Testing auth endpoint...' })
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/auth/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.status === 401) {
        setStatus({ 
          backend: 'connected', 
          message: 'Auth endpoint working (401 Unauthorized as expected without token)' 
        })
      } else if (response.ok) {
        setStatus({ 
          backend: 'connected', 
          message: 'Auth endpoint working and user is authenticated' 
        })
      } else {
        setStatus({ 
          backend: 'error', 
          message: `Auth endpoint responded with status: ${response.status}` 
        })
      }
    } catch (error) {
      setStatus({ 
        backend: 'error', 
        message: `Auth endpoint failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      })
    }
  }

  const getStatusIcon = () => {
    switch (status.backend) {
      case 'checking':
        return <Loader2 className="h-5 w-5 animate-spin text-primary-light-purple" />
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getStatusColor = () => {
    switch (status.backend) {
      case 'checking':
        return 'text-primary-light-purple'
      case 'connected':
        return 'text-green-500'
      case 'error':
        return 'text-red-500'
    }
  }

  return (
    <div className="card max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Frontend-Backend Connection Test</h2>
      
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button onClick={testBackendConnection} variant="primary">
            Test Backend Connection
          </Button>
          <Button onClick={testAuthEndpoint} variant="outline">
            Test Auth Endpoint
          </Button>
        </div>
        
        <div className="flex items-center gap-3 p-4 bg-secondary-dark rounded-lg">
          {getStatusIcon()}
          <div>
            <p className={`font-medium ${getStatusColor()}`}>
              Status: {status.backend.charAt(0).toUpperCase() + status.backend.slice(1)}
            </p>
            <p className="text-text-secondary text-sm">{status.message}</p>
          </div>
        </div>
        
        <div className="text-sm text-text-muted">
          <p><strong>Backend URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}</p>
          <p><strong>Frontend URL:</strong> http://localhost:3000 (Next.js default)</p>
          <p><strong>Expected Backend Response:</strong> {"{ ok: true }"}</p>
        </div>
      </div>
    </div>
  )
}
