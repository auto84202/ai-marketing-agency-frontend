'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Button } from '@/components/ui/Button'
import { Users, Plus, Search, Filter, X, Mail, Phone, Building, Globe, DollarSign, FileText, Check } from 'lucide-react'

interface Client {
  id: string
  name: string
  email: string
  company: string
  industry: string
  campaigns: number
  status: string
  budget: number
  phone?: string
  website?: string
  notes?: string
}

interface ApiClient {
  id: string
  name: string
  email: string
  company?: string
  industry?: string
  budget?: number
  phone?: string
  website?: string
  notes?: string
}

interface ClientData {
  name: string
  email: string
  company?: string
  phone?: string
  website?: string
  industry?: string
  budget?: number
  notes?: string
}

export default function ClientsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    website: '',
    industry: '',
    budget: '',
    notes: ''
  })

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    status: '',
    industry: '',
    budgetMin: '',
    budgetMax: ''
  })

  // View Details Modal state
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  // Edit Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    website: '',
    industry: '',
    budget: '',
    notes: ''
  })

  // Client data from API - start with empty array, will be populated from database
  const [clients, setClients] = useState<Client[]>([])
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  // Filtered clients based on search and filter
  const [filteredClients, setFilteredClients] = useState<Client[]>([])

  // Fetch clients on component mount
  useEffect(() => {
    fetchClients()
  }, [])

  // Search and filter logic
  useEffect(() => {
    let filtered = clients

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query) ||
        client.company.toLowerCase().includes(query)
      )
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(client => client.status === filters.status)
    }

    // Apply industry filter
    if (filters.industry) {
      filtered = filtered.filter(client => client.industry === filters.industry)
    }

    // Apply budget range filter
    if (filters.budgetMin) {
      filtered = filtered.filter(client => client.budget >= parseInt(filters.budgetMin))
    }
    if (filters.budgetMax) {
      filtered = filtered.filter(client => client.budget <= parseInt(filters.budgetMax))
    }

    setFilteredClients(filtered)
  }, [searchQuery, filters, clients])

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: '',
      industry: '',
      budgetMin: '',
      budgetMax: ''
    })
    setSearchQuery('')
  }

  // Apply filters
  const applyFilters = () => {
    setIsFilterOpen(false)
  }

  // Handle view details
  const handleViewDetails = (client: Client) => {
    setSelectedClient(client)
    setIsDetailsModalOpen(true)
  }

  // Handle edit client
  const handleEditClient = (client: Client) => {
    setSelectedClient(client)
    setEditFormData({
      name: client.name,
      email: client.email,
      company: client.company,
      phone: client.phone || '',
      website: client.website || '',
      industry: client.industry,
      budget: client.budget.toString(),
      notes: client.notes || ''
    })
    setIsEditModalOpen(true)
    setIsDetailsModalOpen(false) // Close details modal
  }

  // Handle edit form change
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEditFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  // Fetch clients from API
  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await fetch(`${apiUrl}/clients`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const responseData = await response.json()
        console.log('API Response:', responseData)

        // Handle the API response structure: { success: true, data: [...], pagination: {...} }
        const clientsData = responseData.data || responseData
        const clientsArray = Array.isArray(clientsData) ? clientsData : []

        // Transform API data to match our Client interface
        const transformedClients = clientsArray.map((client: ApiClient) => ({
          id: client.id,
          name: client.name,
          email: client.email,
          company: client.company || client.name,
          industry: client.industry || 'Other',
          campaigns: Math.floor(Math.random() * 20) + 1, // Mock campaigns count
          status: ['Active', 'Pending', 'Inactive'][Math.floor(Math.random() * 3)], // Mock status
          budget: client.budget || Math.floor(Math.random() * 50000) + 5000, // Mock budget
          phone: client.phone || '',
          website: client.website || '',
          notes: client.notes || ''
        }))
        setClients(transformedClients)
        console.log('Transformed clients:', transformedClients)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
      // Clear clients if API fails to ensure we don't show stale data
      setClients([])
    }
  }

  // Handle edit form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClient) return

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      // Convert empty strings to undefined and budget to integer (Prisma schema expects Int)
      const clientData: ClientData = {
        name: editFormData.name,
        email: editFormData.email,
        company: editFormData.company || undefined,
        phone: editFormData.phone || undefined,
        website: editFormData.website || undefined,
        industry: editFormData.industry || undefined,
        budget: editFormData.budget ? parseInt(editFormData.budget) : undefined,
        notes: editFormData.notes || undefined
      }

      const token = localStorage.getItem('auth_token')
      if (!token) {
        setError('Please login first to edit clients.')
        setIsLoading(false)
        return
      }

      console.log('Editing client:', selectedClient.id, clientData)
      console.log('Selected client:', selectedClient)

      const response = await fetch(`${apiUrl}/clients/${selectedClient.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(clientData)
      })

      console.log('Update response status:', response.status)

      if (!response.ok) {
        let errorMessage = `Failed to update client (${response.status})`
        try {
          const errorData = await response.json()
          console.error('Update error response:', errorData)
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch (parseError) {
          console.error('Could not parse error response:', parseError)
          errorMessage = `Server error (${response.status}): ${response.statusText || 'Unknown error'}`
        }
        throw new Error(errorMessage)
      }

      const responseData = await response.json()
      console.log('Client updated successfully:', responseData)

      setSuccess('Client updated successfully!')
      setIsEditModalOpen(false)
      setSelectedClient(null)

      // Refresh client list after successful update
      await fetchClients()

      // Show success message for 2 seconds
      setTimeout(() => {
        setSuccess('')
      }, 2000)

    } catch (error: unknown) {
      console.error('Error updating client:', error)

      const errorMessage = error instanceof Error ? error.message : 'Failed to update client. Please try again.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      // Convert empty strings to undefined and budget to integer (Prisma schema expects Int)
      const clientData: ClientData = {
        name: formData.name,
        email: formData.email,
        company: formData.company || undefined,
        phone: formData.phone || undefined,
        website: formData.website || undefined,
        industry: formData.industry || undefined,
        budget: formData.budget ? parseInt(formData.budget) : undefined,
        notes: formData.notes || undefined
      }

      // Check if user is authenticated
      const token = localStorage.getItem('auth_token')
      if (!token) {
        setError('Please login first to create clients.')
        setIsLoading(false)
        return
      }

      console.log('Using token:', token)
      console.log('Token length:', token?.length)
      console.log('Sending client data:', clientData)

      const response = await fetch(`${apiUrl}/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(clientData)
      })

      console.log('API response status:', response.status)
      console.log('API response headers:', Object.fromEntries(response.headers.entries()))
      const responseData = await response.json()
      console.log('API response data:', responseData)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseData.message || 'Unknown error'}`)
      }

      console.log('Client created successfully:', responseData)

      setSuccess('Client created successfully!')
      setIsModalOpen(false)
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        website: '',
        industry: '',
        budget: '',
        notes: ''
      })

      // Refresh client list after successful creation
      await fetchClients()

      // Show success message for 2 seconds
      setTimeout(() => {
        setSuccess('')
      }, 2000)

    } catch (error: unknown) {
      console.error('Error creating client:', error)

      const axiosError = error as {
        response?: {
          status?: number
          data?: {
            message?: string
            error?: string
          }
        }
        message?: string
      }

      console.log('Error details:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message
      })

      if (axiosError.response?.status === 401) {
        setError('Please login first to create clients.')
        // Redirect to login
        setTimeout(() => {
          window.location.href = '/auth/login'
        }, 2000)
      } else if (axiosError.response?.status === 500) {
        const errorMsg = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Server error. Please try again later or contact support.'
        setError(errorMsg)
      } else {
        setError(axiosError.response?.data?.message || axiosError.message || 'Failed to create client. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Header />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <Breadcrumb items={[{ label: 'Clients' }]} />

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Client Management</h1>
            <p className="text-text-secondary">Manage your clients and their information</p>
          </div>
          <Button
            className="bg-primary-light-purple hover:bg-primary-pink text-white"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5">
              <Image
                src="/logo.png"
                alt="Logo"
                width={20}
                height={20}
                className="object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
            <Search className="absolute left-11 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary-light-purple"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setIsFilterOpen(true)}
            className="text-white border-white hover:bg-white hover:text-primary-dark"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
            {(filters.status || filters.industry || filters.budgetMin || filters.budgetMax) && (
              <span className="ml-2 bg-primary-light-purple text-white text-xs px-2 py-1 rounded-full">
                {[filters.status, filters.industry, filters.budgetMin, filters.budgetMax].filter(Boolean).length}
              </span>
            )}
          </Button>
        </div>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredClients.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="bg-white/10 rounded-xl p-8 border border-white/20">
                <Users className="h-12 w-12 text-text-secondary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  {searchQuery || Object.values(filters).some(Boolean)
                    ? "No clients found"
                    : "No clients yet"}
                </h3>
                <p className="text-text-secondary mb-4">
                  {searchQuery || Object.values(filters).some(Boolean)
                    ? "Try adjusting your search or filter criteria"
                    : "Get started by adding your first client to the database"}
                </p>
                {(searchQuery || Object.values(filters).some(Boolean)) && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="text-white border-white/30 hover:bg-white hover:text-primary-dark"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          ) : (
            filteredClients.map((client) => (
            <div key={client.id} className="card group hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-light-purple/20">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 bg-gradient-to-r from-primary-light-purple to-primary-pink rounded-full flex items-center justify-center shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-white">{client.name}</h3>
                  <p className="text-text-secondary text-sm">{client.email}</p>
                </div>
              </div>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary text-sm">Campaigns:</span>
                  <span className="text-white text-sm font-semibold bg-primary-light-purple/20 px-2 py-1 rounded-full">{client.campaigns}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary text-sm">Status:</span>
                  <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                    client.status === 'Active' ? 'text-green-400 bg-green-400/20' :
                    client.status === 'Pending' ? 'text-yellow-400 bg-yellow-400/20' :
                    'text-red-400 bg-red-400/20'
                  }`}>
                    {client.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary text-sm">Revenue:</span>
                  <span className="text-green-400 text-sm font-semibold">${(client.campaigns * 1250).toLocaleString()}</span>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => handleViewDetails(client)}
                className="w-full text-white border-white/30 hover:bg-white hover:text-primary-dark transition-all duration-300 hover:border-white"
              >
                View Details
              </Button>
            </div>
            ))
          )}
        </div>
      </main>

      {/* Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl max-w-md w-full shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary-light-purple to-primary-pink rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-white">Filter Clients</h2>
                <p className="text-white/80 text-sm mt-1">Filter clients by status, industry, and budget</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsFilterOpen(false)}
                className="text-white border-white/30 hover:bg-white hover:text-primary-dark transition-all duration-300"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Status</label>
                <div className="space-y-2">
                  {['Active', 'Pending', 'Inactive'].map((status) => (
                    <label key={status} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value={status}
                        checked={filters.status === status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="sr-only"
                      />
                      <div className={`flex items-center justify-center w-5 h-5 rounded-full border-2 mr-3 transition-all duration-200 ${
                        filters.status === status
                          ? 'border-primary-light-purple bg-primary-light-purple'
                          : 'border-gray-300 hover:border-primary-light-purple'
                      }`}>
                        {filters.status === status && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span className="text-gray-700">{status}</span>
                    </label>
                  ))}
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, status: '' }))}
                    className="text-sm text-primary-light-purple hover:text-primary-pink transition-colors"
                  >
                    Clear status filter
                  </button>
                </div>
              </div>

              {/* Industry Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Industry</label>
                <select
                  value={filters.industry}
                  onChange={(e) => setFilters(prev => ({ ...prev, industry: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light-purple focus:border-primary-light-purple transition-all duration-300 bg-white text-gray-900"
                >
                  <option value="">All Industries</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="Retail">Retail</option>
                  <option value="Education">Education</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Budget Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Budget Range ($)</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Min</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={filters.budgetMin}
                      onChange={(e) => setFilters(prev => ({ ...prev, budgetMin: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light-purple focus:border-primary-light-purple transition-all duration-300 bg-white text-gray-900 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Max</label>
                    <input
                      type="number"
                      placeholder="No limit"
                      value={filters.budgetMax}
                      onChange={(e) => setFilters(prev => ({ ...prev, budgetMax: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light-purple focus:border-primary-light-purple transition-all duration-300 bg-white text-gray-900 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex justify-between space-x-4 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300"
                >
                  Clear All
                </Button>
                <Button
                  onClick={applyFilters}
                  className="bg-gradient-to-r from-primary-light-purple to-primary-pink hover:from-primary-light-purple/90 hover:to-primary-pink/90 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Client Details Modal */}
      {isDetailsModalOpen && selectedClient && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary-light-purple to-primary-pink rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold text-white">Client Details</h2>
                <p className="text-white/80 text-sm mt-1">View detailed information about {selectedClient.name}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsDetailsModalOpen(false)}
                className="text-white border-white/30 hover:bg-white hover:text-primary-dark transition-all duration-300"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Client Header */}
              <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
                <div className="h-16 w-16 bg-gradient-to-r from-primary-light-purple to-primary-pink rounded-full flex items-center justify-center shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedClient.name}</h3>
                  <p className="text-gray-600">{selectedClient.company}</p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedClient.status === 'Active' ? 'text-green-700 bg-green-100' :
                    selectedClient.status === 'Pending' ? 'text-yellow-700 bg-yellow-100' :
                    'text-red-700 bg-red-100'
                  }`}>
                    {selectedClient.status}
                  </span>
                </div>
              </div>

              {/* Client Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Contact Information</h4>

                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-primary-light-purple" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-900 font-medium">{selectedClient.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-primary-light-purple" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-gray-900 font-medium">{selectedClient.phone || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-primary-light-purple" />
                    <div>
                      <p className="text-sm text-gray-500">Website</p>
                      <p className="text-gray-900 font-medium">
                        {selectedClient.website ? (
                          <a href={selectedClient.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                            {selectedClient.website}
                          </a>
                        ) : 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Business Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Business Information</h4>

                  <div className="flex items-center space-x-3">
                    <Building className="h-5 w-5 text-primary-light-purple" />
                    <div>
                      <p className="text-sm text-gray-500">Industry</p>
                      <p className="text-gray-900 font-medium">{selectedClient.industry || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-primary-light-purple" />
                    <div>
                      <p className="text-sm text-gray-500">Monthly Budget</p>
                      <p className="text-gray-900 font-medium">${selectedClient.budget?.toLocaleString() || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-primary-light-purple" />
                    <div>
                      <p className="text-sm text-gray-500">Active Campaigns</p>
                      <p className="text-gray-900 font-medium">{selectedClient.campaigns || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedClient.notes && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-3">Notes</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">{selectedClient.notes}</p>
                  </div>
                </div>
              )}

              {/* Performance Metrics */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">Performance Metrics</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600 font-medium">Total Revenue</p>
                        <p className="text-2xl font-bold text-blue-900">${((selectedClient.campaigns || 0) * 1250).toLocaleString()}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-blue-500" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600 font-medium">Active Campaigns</p>
                        <p className="text-2xl font-bold text-green-900">{selectedClient.campaigns || 0}</p>
                      </div>
                      <Users className="h-8 w-8 text-green-500" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600 font-medium">Avg. Campaign Value</p>
                        <p className="text-2xl font-bold text-purple-900">$1,250</p>
                      </div>
                      <FileText className="h-8 w-8 text-purple-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300"
                >
                  Close
                </Button>
                <Button
                  onClick={() => handleEditClient(selectedClient)}
                  className="bg-gradient-to-r from-primary-light-purple to-primary-pink hover:from-primary-light-purple/90 hover:to-primary-pink/90 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Edit Client
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {isEditModalOpen && selectedClient && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary-light-purple to-primary-pink rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold text-white">Edit Client</h2>
                <p className="text-white/80 text-sm mt-1">Update information for {selectedClient.name}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                className="text-white border-white/30 hover:bg-white hover:text-primary-dark transition-all duration-300"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <X className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">{success}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="inline h-4 w-4 mr-2" />
                    Client Name *
                  </label>
                  <input
                    type="text"
                    id="edit-name"
                    name="name"
                    required
                    value={editFormData.name}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-light-purple focus:border-primary-light-purple transition-all duration-300 bg-white text-gray-900 hover:bg-gray-50"
                    placeholder="Enter client name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="inline h-4 w-4 mr-2" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="edit-email"
                    name="email"
                    required
                    value={editFormData.email}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-light-purple focus:border-primary-light-purple transition-all duration-300 bg-white text-gray-900 hover:bg-gray-50"
                    placeholder="client@example.com"
                  />
                </div>

                {/* Company */}
                <div>
                  <label htmlFor="edit-company" className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="inline h-4 w-4 mr-2" />
                    Company
                  </label>
                  <input
                    type="text"
                    id="edit-company"
                    name="company"
                    value={editFormData.company}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-light-purple focus:border-primary-light-purple transition-all duration-300 bg-white text-gray-900 hover:bg-gray-50"
                    placeholder="Company name"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="edit-phone" className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="inline h-4 w-4 mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="edit-phone"
                    name="phone"
                    value={editFormData.phone}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-light-purple focus:border-primary-light-purple transition-all duration-300 bg-white text-gray-900 hover:bg-gray-50"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                {/* Website */}
                <div>
                  <label htmlFor="edit-website" className="block text-sm font-medium text-gray-700 mb-2">
                    <Globe className="inline h-4 w-4 mr-2" />
                    Website
                  </label>
                  <input
                    type="url"
                    id="edit-website"
                    name="website"
                    value={editFormData.website}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-light-purple focus:border-primary-light-purple transition-all duration-300 bg-white text-gray-900 hover:bg-gray-50"
                    placeholder="https://example.com"
                  />
                </div>

                {/* Industry */}
                <div>
                  <label htmlFor="edit-industry" className="block text-sm font-medium text-gray-700 mb-2">
                    Industry
                  </label>
                  <select
                    id="edit-industry"
                    name="industry"
                    value={editFormData.industry}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-light-purple focus:border-primary-light-purple transition-all duration-300 bg-white text-gray-900 hover:bg-gray-50"
                  >
                    <option value="">Select Industry</option>
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                    <option value="Retail">Retail</option>
                    <option value="Education">Education</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Budget */}
                <div>
                  <label htmlFor="edit-budget" className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="inline h-4 w-4 mr-2" />
                    Monthly Budget ($)
                  </label>
                  <input
                    type="number"
                    id="edit-budget"
                    name="budget"
                    value={editFormData.budget}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-light-purple focus:border-primary-light-purple transition-all duration-300 bg-white text-gray-900 hover:bg-gray-50"
                    placeholder="5000"
                    min="0"
                    step="100"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="edit-notes" className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="inline h-4 w-4 mr-2" />
                  Notes
                </label>
                <textarea
                  id="edit-notes"
                  name="notes"
                  rows={4}
                  value={editFormData.notes}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-light-purple focus:border-primary-light-purple transition-all duration-300 bg-white text-gray-900 hover:bg-gray-50 resize-none"
                  placeholder="Additional notes about the client..."
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isLoading}
                  className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-primary-light-purple to-primary-pink hover:from-primary-light-purple/90 hover:to-primary-pink/90 text-white px-8 py-2 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating Client...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Update Client
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary-light-purple to-primary-pink rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold text-white">Add New Client</h2>
                <p className="text-white/80 text-sm mt-1">Create a new client profile for your marketing campaigns</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="text-white border-white/30 hover:bg-white hover:text-primary-dark transition-all duration-300"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <X className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">{success}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="inline h-4 w-4 mr-2" />
                    Client Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-light-purple focus:border-primary-light-purple transition-all duration-300 bg-white text-gray-900 hover:bg-gray-50"
                    placeholder="Enter client name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="inline h-4 w-4 mr-2" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-light-purple focus:border-primary-light-purple transition-all duration-300 bg-white text-gray-900 hover:bg-gray-50"
                    placeholder="client@example.com"
                  />
                </div>

                {/* Company */}
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="inline h-4 w-4 mr-2" />
                    Company
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-light-purple focus:border-primary-light-purple transition-all duration-300 bg-white text-gray-900 hover:bg-gray-50"
                    placeholder="Company name"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="inline h-4 w-4 mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-light-purple focus:border-primary-light-purple transition-all duration-300 bg-white text-gray-900 hover:bg-gray-50"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                {/* Website */}
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                    <Globe className="inline h-4 w-4 mr-2" />
                    Website
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-light-purple focus:border-primary-light-purple transition-all duration-300 bg-white text-gray-900 hover:bg-gray-50"
                    placeholder="https://example.com"
                  />
                </div>

                {/* Industry */}
                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                    Industry
                  </label>
                  <select
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-light-purple focus:border-primary-light-purple transition-all duration-300 bg-white text-gray-900 hover:bg-gray-50"
                  >
                    <option value="">Select Industry</option>
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                    <option value="Retail">Retail</option>
                    <option value="Education">Education</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Budget */}
                <div>
                  <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="inline h-4 w-4 mr-2" />
                    Monthly Budget ($)
                  </label>
                  <input
                    type="number"
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-light-purple focus:border-primary-light-purple transition-all duration-300 bg-white text-gray-900 hover:bg-gray-50"
                    placeholder="5000"
                    min="0"
                    step="100"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="inline h-4 w-4 mr-2" />
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-light-purple focus:border-primary-light-purple transition-all duration-300 bg-white text-gray-900 hover:bg-gray-50 resize-none"
                  placeholder="Additional notes about the client..."
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isLoading}
                  className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-primary-light-purple to-primary-pink hover:from-primary-light-purple/90 hover:to-primary-pink/90 text-white px-8 py-2 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Client...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Client
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
