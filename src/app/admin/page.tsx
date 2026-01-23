'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  BarChart3, 
  Settings, 
  Shield, 
  Activity,
  UserPlus,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  company?: string;
  phone?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    campaigns: number;
    clients: number;
    aiContent: number;
    socialPosts: number;
    chatbots: number;
    invoices: number;
  };
}

interface SystemAnalytics {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalCampaigns: number;
    totalClients: number;
    totalRevenue: number;
  };
  userStats: Array<{
    role: string;
    _count: { role: number };
  }>;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    createdAt: string;
    role: string;
  }>;
  monthlyRegistrations: Array<{
    month: string;
    count: number;
  }>;
}

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Check admin access
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          router.push('/dashboard');
          return;
        }

        const response = await fetch(`${apiUrl}/admin/check`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.isAdmin);
          if (!data.isAdmin) {
            router.push('/dashboard');
          }
        } else {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error checking admin access:', error);
        router.push('/dashboard');
      }
    };

    checkAdminAccess();
  }, [router, apiUrl]);

  // Fetch data
  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin, activeTab]);

  const fetchData = async () => {
    // Fetch users with limit of 30 to show all PostgreSQL users
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      if (activeTab === 'dashboard') {
        const [analyticsRes, usersRes] = await Promise.all([
          fetch(`${apiUrl}/admin/analytics`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${apiUrl}/admin/users?limit=30`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (analyticsRes.ok) {
          const analyticsData = await analyticsRes.json();
          setAnalytics(analyticsData.data);
        }

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData.data);
        }
      } else if (activeTab === 'users') {
        const usersRes = await fetch(`${apiUrl}/admin/users?limit=30&search=${searchQuery}&role=${roleFilter}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData.data);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery || 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.company?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = !roleFilter || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-dark via-primary-medium to-primary-light-purple flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-text-secondary">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-dark via-primary-medium to-primary-light-purple">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-primary-light-purple" />
              <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-light-purple hover:bg-primary-light-purple/90 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-white hover:text-primary-light-purple transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white/5 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'campaigns', label: 'Campaigns', icon: Activity },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-light-purple text-primary-light-purple'
                      : 'border-transparent text-text-secondary hover:text-white hover:border-white/30'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-light-purple"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-400">{error}</span>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && analytics && (
              <div className="space-y-6">
                {/* Overview Cards */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="card">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Users className="h-8 w-8 text-blue-500" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-text-secondary">Total Users</p>
                        <p className="text-2xl font-bold text-white">{analytics.overview.totalUsers}</p>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-text-secondary">Active Users</p>
                        <p className="text-2xl font-bold text-white">{analytics.overview.activeUsers}</p>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Activity className="h-8 w-8 text-purple-500" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-text-secondary">Total Campaigns</p>
                        <p className="text-2xl font-bold text-white">{analytics.overview.totalCampaigns}</p>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <TrendingUp className="h-8 w-8 text-yellow-500" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-text-secondary">Total Revenue</p>
                        <p className="text-2xl font-bold text-white">${analytics.overview.totalRevenue}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Users */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Users</h3>
                  <div className="space-y-3">
                    {analytics.recentUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary-light-purple rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{user.name || 'No Name'}</p>
                            <p className="text-text-secondary text-sm">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                            user.role === 'USER' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role}
                          </span>
                          <span className="text-text-secondary text-sm">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                {/* Search and Filters */}
                <div className="card">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <img 
                          src="/logo.png" 
                          alt="Logo" 
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        <Search className="absolute left-11 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
                        <input
                          type="text"
                          placeholder="Search users..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-16 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary-light-purple"
                        />
                      </div>
                    </div>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-primary-light-purple"
                    >
                      <option value="">All Roles</option>
                      <option value="ADMIN">Admin</option>
                      <option value="USER">User</option>
                      <option value="CLIENT">Client</option>
                    </select>
                  </div>
                </div>

                {/* Users Table */}
                <div className="card">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/20">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                            Activity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {filteredUsers.map((user) => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-primary-light-purple rounded-full flex items-center justify-center mr-3">
                                  <span className="text-white text-sm font-medium">
                                    {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-white">
                                    {user.name || 'No Name'}
                                  </div>
                                  <div className="text-sm text-text-secondary">
                                    {user.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                                user.role === 'USER' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {user.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                              <div>
                                <div>{user._count.campaigns} campaigns</div>
                                <div>{user._count.clients} clients</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button className="text-primary-light-purple hover:text-primary-light-purple/80">
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button className="text-blue-500 hover:text-blue-400">
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button className="text-red-500 hover:text-red-400">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Campaigns Tab */}
            {activeTab === 'campaigns' && (
              <div className="space-y-6">
                {/* Campaign Stats */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="card">
                    <div className="flex items-center">
                      <Activity className="h-8 w-8 text-green-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-text-secondary">Active Campaigns</p>
                        <p className="text-2xl font-bold text-white">{analytics?.overview.totalCampaigns || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card">
                    <div className="flex items-center">
                      <BarChart3 className="h-8 w-8 text-blue-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-text-secondary">Total Clients</p>
                        <p className="text-2xl font-bold text-white">{analytics?.overview.totalClients || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card">
                    <div className="flex items-center">
                      <TrendingUp className="h-8 w-8 text-yellow-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-text-secondary">Performance</p>
                        <p className="text-2xl font-bold text-white">94%</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Campaign Management Info */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-white mb-4">Campaign Management</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="text-white font-medium mb-1">Monitor All Campaigns</h4>
                          <p className="text-sm text-text-secondary">
                            View and manage all user campaigns across the platform. Track performance metrics and user engagement.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-start">
                        <Activity className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="text-white font-medium mb-1">Real-time Analytics</h4>
                          <p className="text-sm text-text-secondary">
                            Access real-time campaign analytics including impressions, clicks, conversions, and ROI tracking.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-start">
                        <Shield className="h-5 w-5 text-purple-500 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="text-white font-medium mb-1">Campaign Moderation</h4>
                          <p className="text-sm text-text-secondary">
                            Review and approve campaigns before they go live. Ensure compliance with platform policies.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* System Settings */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-white mb-6">System Configuration</h3>
                  <div className="space-y-6">
                    {/* General Settings */}
                    <div>
                      <h4 className="text-white font-medium mb-3 flex items-center">
                        <Settings className="h-4 w-4 mr-2" />
                        General Settings
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div>
                            <p className="text-white font-medium">Maintenance Mode</p>
                            <p className="text-sm text-text-secondary">Temporarily disable user access</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-light-purple rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-light-purple"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div>
                            <p className="text-white font-medium">User Registration</p>
                            <p className="text-sm text-text-secondary">Allow new user signups</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-light-purple rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-light-purple"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* API Configuration */}
                    <div>
                      <h4 className="text-white font-medium mb-3 flex items-center">
                        <Activity className="h-4 w-4 mr-2" />
                        API Configuration
                      </h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-white font-medium">OpenAI API</p>
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Connected</span>
                          </div>
                          <p className="text-sm text-text-secondary">AI content generation service</p>
                        </div>
                        
                        <div className="p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-white font-medium">Google Ads API</p>
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Connected</span>
                          </div>
                          <p className="text-sm text-text-secondary">Campaign management integration</p>
                        </div>
                        
                        <div className="p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-white font-medium">Stripe Payment</p>
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Connected</span>
                          </div>
                          <p className="text-sm text-text-secondary">Billing and subscription management</p>
                        </div>
                      </div>
                    </div>

                    {/* Security Settings */}
                    <div>
                      <h4 className="text-white font-medium mb-3 flex items-center">
                        <Shield className="h-4 w-4 mr-2" />
                        Security Settings
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div>
                            <p className="text-white font-medium">Two-Factor Authentication</p>
                            <p className="text-sm text-text-secondary">Require 2FA for admin accounts</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-light-purple rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-light-purple"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div>
                            <p className="text-white font-medium">Session Timeout</p>
                            <p className="text-sm text-text-secondary">Auto-logout after inactivity</p>
                          </div>
                          <select className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white text-sm">
                            <option value="30">30 minutes</option>
                            <option value="60" selected>1 hour</option>
                            <option value="120">2 hours</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Info */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-white mb-4">System Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-white/5 rounded-lg">
                      <p className="text-sm text-text-secondary mb-1">Platform Version</p>
                      <p className="text-white font-medium">v2.0.1</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg">
                      <p className="text-sm text-text-secondary mb-1">Last Backup</p>
                      <p className="text-white font-medium">{new Date().toLocaleDateString()}</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg">
                      <p className="text-sm text-text-secondary mb-1">Database Status</p>
                      <p className="text-green-400 font-medium">Healthy</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg">
                      <p className="text-sm text-text-secondary mb-1">Server Status</p>
                      <p className="text-green-400 font-medium">Online</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
