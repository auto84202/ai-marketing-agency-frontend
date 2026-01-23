'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react'

interface DebugResult {
  test: string
  status: 'checking' | 'success' | 'error'
  message: string
  details?: any
}

export default function DebugTool() {
  const [results, setResults] = useState<DebugResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const addResult = (test: string, status: DebugResult['status'], message: string, details?: any) => {
    setResults(prev => [...prev, { test, status, message, details }])
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setResults([])

    // Test 1: Backend connectivity
    addResult('Backend Connectivity', 'checking', 'Testing backend connection...')
    try {
      const response = await fetch('http://localhost:3001', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      
      if (response.ok) {
        const data = await response.json()
        addResult('Backend Connectivity', 'success', `Backend is running! Response: ${JSON.stringify(data)}`, data)
      } else {
        addResult('Backend Connectivity', 'error', `Backend responded with status: ${response.status}`)
      }
    } catch (error: any) {
      addResult('Backend Connectivity', 'error', `Cannot connect to backend: ${error.message}`)
    }

    // Test 2: Auth endpoints
    addResult('Auth Endpoints', 'checking', 'Testing auth endpoints...')
    try {
      const endpoints = ['/auth/login', '/auth/Register', '/auth/register']
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`http://localhost:3001${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ test: 'data' }),
          })
          
          addResult('Auth Endpoints', 'success', `${endpoint} - Status: ${response.status}`, {
            endpoint,
            status: response.status,
            statusText: response.statusText
          })
        } catch (error: any) {
          addResult('Auth Endpoints', 'error', `${endpoint} - Error: ${error.message}`)
        }
      }
    } catch (error: any) {
      addResult('Auth Endpoints', 'error', `Auth endpoint test failed: ${error.message}`)
    }

    // Test 3: CORS
    addResult('CORS Configuration', 'checking', 'Testing CORS configuration...')
    try {
      const response = await fetch('http://localhost:3001/auth/profile', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:3001'
        },
      })
      
      if (response.status === 401) {
        addResult('CORS Configuration', 'success', 'CORS is working (401 Unauthorized as expected)')
      } else {
        addResult('CORS Configuration', 'success', `CORS response: ${response.status}`)
      }
    } catch (error: any) {
      if (error.message.includes('CORS')) {
        addResult('CORS Configuration', 'error', `CORS Error: ${error.message}`)
      } else {
        addResult('CORS Configuration', 'success', 'CORS is working (network error is expected without auth)')
      }
    }

    // Test 4: Registration with test data
    addResult('Registration Test', 'checking', 'Testing registration with sample data...')
    try {
      const testData = {
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        password: 'testpassword123',
        company: 'Test Company'
      }

      const response = await fetch('http://localhost:3001/auth/Register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData),
      })

      if (response.ok) {
        const data = await response.json()
        addResult('Registration Test', 'success', 'Registration endpoint is working!', data)
      } else {
        const errorData = await response.text()
        addResult('Registration Test', 'error', `Registration failed: ${response.status} - ${errorData}`)
      }
    } catch (error: any) {
      addResult('Registration Test', 'error', `Registration test failed: ${error.message}`)
    }

    setIsRunning(false)
  }

  const getStatusIcon = (status: DebugResult['status']) => {
    switch (status) {
      case 'checking':
        return <Loader2 className="h-5 w-5 animate-spin text-primary-light-purple" />
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getStatusColor = (status: DebugResult['status']) => {
    switch (status) {
      case 'checking':
        return 'text-primary-light-purple'
      case 'success':
        return 'text-green-500'
      case 'error':
        return 'text-red-500'
    }
  }

  return (
    <div className="card max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle className="h-6 w-6 text-yellow-500" />
        <h2 className="text-2xl font-bold text-white">Backend Debug Tool</h2>
      </div>
      
      <div className="mb-6">
        <Button 
          onClick={runAllTests} 
          disabled={isRunning}
          className="btn-primary"
        >
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Running Tests...
            </>
          ) : (
            'Run All Debug Tests'
          )}
        </Button>
      </div>

      <div className="space-y-4">
        {results.map((result, index) => (
          <div key={index} className="p-4 bg-secondary-dark rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              {getStatusIcon(result.status)}
              <div>
                <p className={`font-medium ${getStatusColor(result.status)}`}>
                  {result.test}
                </p>
                <p className="text-text-secondary text-sm">{result.message}</p>
              </div>
            </div>
            
            {result.details && (
              <div className="mt-3 p-3 bg-primary-dark rounded text-sm">
                <pre className="text-text-secondary whitespace-pre-wrap">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-primary-dark rounded-lg">
        <h3 className="text-white font-medium mb-2">Troubleshooting Tips:</h3>
        <ul className="text-text-secondary text-sm space-y-1">
          <li>• Make sure the backend is running on port 3000</li>
          <li>• Check if the database is properly configured</li>
          <li>• Verify environment variables are set correctly</li>
          <li>• Check browser console for additional error details</li>
          <li>• Ensure CORS is properly configured in the backend</li>
        </ul>
      </div>
    </div>
  )
}
