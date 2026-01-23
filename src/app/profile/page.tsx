'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Button } from '@/components/ui/Button'
import { User, Mail, Calendar, Shield, Edit, Save, X, Camera } from 'lucide-react'

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  company?: string
  phone?: string
  avatar?: string
  createdAt: string
  lastLoginAt?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  
  const [editForm, setEditForm] = useState({
    name: '',
    company: '',
    phone: ''
  })
  const [uploading, setUploading] = useState(false)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError('')
      
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Please login to view profile')
      }

      const response = await fetch(`${apiUrl}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }

      const userData = await response.json()
      setProfile(userData)
      setEditForm({
        name: userData.name || '',
        company: userData.company || '',
        phone: userData.phone || ''
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError(error instanceof Error ? error.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleEdit = () => {
    setEditing(true)
    setError('')
    setSuccess('')
  }

  const handleCancel = () => {
    setEditing(false)
    if (profile) {
      setEditForm({
        name: profile.name || '',
        company: profile.company || '',
        phone: profile.phone || ''
      })
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')
      
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Please login to update profile')
      }

      const response = await fetch(`${apiUrl}/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editForm.name,
          company: editForm.company,
          phone: editForm.phone
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const responseData = await response.json()
      // Handle different response structures
      const updatedUser = responseData.user || responseData.data || responseData
      
      // Refresh profile data from server to ensure consistency
      await fetchProfile()
      
      setEditing(false)
      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      setError(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAvatarClick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/jpeg,image/jpg,image/png,image/gif,image/webp'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB')
        setTimeout(() => setError(''), 3000)
        return
      }

      // Validate file type
      if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
        setError('Please upload a valid image file (JPEG, PNG, GIF, or WebP)')
        setTimeout(() => setError(''), 3000)
        return
      }

      await uploadAvatar(file)
    }
    input.click()
  }

  const uploadAvatar = async (file: File) => {
    try {
      setUploading(true)
      setError('')
      setSuccess('')
      
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Please login to upload avatar')
      }

      const formData = new FormData()
      formData.append('avatar', file)

      const response = await fetch(`${apiUrl}/auth/profile/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to upload avatar')
      }

      const data = await response.json()
      
      // Refresh profile data from server to ensure avatar is saved and persisted
      await fetchProfile()
      
      setSuccess('Profile picture updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error uploading avatar:', error)
      setError(error instanceof Error ? error.message : 'Failed to upload avatar')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">Unable to load profile</p>
          <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Header />
      
      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 py-8 lg:px-8">
        <Breadcrumb items={[{ label: 'Profile' }]} />
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
            <p className="text-text-secondary">Manage your account information and preferences</p>
          </div>
          {!editing && (
            <Button
              onClick={handleEdit}
              className="bg-primary-light-purple hover:bg-primary-pink text-white"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
            <p className="text-green-300">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Picture & Basic Info */}
          <div className="lg:col-span-1">
            <div className="card text-center">
              <div className="relative inline-block mb-6">
                <div 
                  className={`w-32 h-32 bg-primary-light-purple/20 rounded-full flex items-center justify-center mx-auto cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-primary-light-purple ${
                    editing || !profile.avatar ? 'hover:bg-primary-light-purple/30' : ''
                  }`}
                  onClick={editing || !profile.avatar ? handleAvatarClick : undefined}
                  title={editing || !profile.avatar ? 'Click to upload profile picture' : ''}
                >
                  {profile.avatar ? (
                    <img
                      src={profile.avatar.startsWith('http') ? profile.avatar : `${apiUrl}${profile.avatar}`}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover"
                      onError={(e) => {
                        // Fallback to default avatar if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('svg')) {
                          const userIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                          userIcon.setAttribute('class', 'h-16 w-16 text-primary-light-purple');
                          userIcon.innerHTML = '<use href="#user-icon"></use>';
                          parent.appendChild(userIcon);
                        }
                      }}
                    />
                  ) : (
                    <User className="h-16 w-16 text-primary-light-purple" />
                  )}
                </div>
                {editing && (
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    disabled={uploading}
                    className="absolute -bottom-2 -right-2 bg-primary-light-purple hover:bg-primary-light-purple/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110 z-10"
                    title="Upload profile picture"
                  >
                    {uploading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </button>
                )}
                {!editing && !profile.avatar && (
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    disabled={uploading}
                    className="absolute -bottom-2 -right-2 bg-primary-light-purple hover:bg-primary-light-purple/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110 z-10"
                    title="Upload profile picture"
                  >
                    {uploading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">
                {editing ? (
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-1 bg-white/10 border border-white/20 rounded text-white text-center focus:outline-none focus:border-primary-light-purple"
                  />
                ) : (
                  profile.name || 'No name set'
                )}
              </h2>
              
              <p className="text-text-secondary mb-4">{profile.role}</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-center text-sm">
                  <Mail className="h-4 w-4 text-text-secondary mr-2" />
                  <span className="text-text-secondary">{profile.email}</span>
                </div>
                
                <div className="flex items-center justify-center text-sm">
                  <Calendar className="h-4 w-4 text-text-secondary mr-2" />
                  <span className="text-text-secondary">
                    Joined {new Date(profile.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                {profile.lastLoginAt && (
                  <div className="flex items-center justify-center text-sm">
                    <Shield className="h-4 w-4 text-text-secondary mr-2" />
                    <span className="text-text-secondary">
                      Last login {new Date(profile.lastLoginAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Information */}
          <div className="lg:col-span-2">
            <div className="card">
              <h3 className="text-xl font-semibold text-white mb-6">Profile Information</h3>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Full Name
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-primary-light-purple"
                    />
                  ) : (
                    <p className="text-white">{profile.name || 'Not set'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Email Address
                  </label>
                  <p className="text-white">{profile.email}</p>
                  <p className="text-xs text-text-secondary mt-1">Email cannot be changed</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Company
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={editForm.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-primary-light-purple"
                      placeholder="Enter company name"
                    />
                  ) : (
                    <p className="text-white">{profile.company || 'Not set'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Phone Number
                  </label>
                  {editing ? (
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-primary-light-purple"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <p className="text-white">{profile.phone || 'Not set'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    User ID
                  </label>
                  <p className="text-white font-mono text-sm">{profile.id}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Account Role
                  </label>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light-purple/20 text-primary-light-purple">
                    {profile.role}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              {editing && (
                <div className="flex space-x-4 mt-8 pt-6 border-t border-white/10">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-primary-light-purple hover:bg-primary-light-purple/90 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="text-white border-white/30 hover:bg-white hover:text-primary-dark"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
