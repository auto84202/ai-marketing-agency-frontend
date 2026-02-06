'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { PlatformDistributionChart, TimeSeriesChart } from '@/components/charts/ScraperCharts';

interface ScraperJob {
    id: string;
    platform: string;
    keyword: string;
    status: string;
    progress: number;
    totalComments: number;
    totalReplies: number;
    createdAt: string;
    startedAt?: string;
    completedAt?: string;
    errorMessage?: string;
}

interface ScraperStats {
    total: number;
    pending: number;
    running: number;
    completed: number;
    failed: number;
    totalComments: number;
    totalReplies: number;
}

export default function SocialScraperPage() {
    const router = useRouter();
    const [jobs, setJobs] = useState<ScraperJob[]>([]);
    const [stats, setStats] = useState<ScraperStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const [newJob, setNewJob] = useState({
        platform: 'INSTAGRAM',
        keyword: '',
        googlePages: 2,
        replyLimit: 5,
        groqApiKey: '',
    });
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['INSTAGRAM']);
    const [isMultiPlatform, setIsMultiPlatform] = useState(false);

    useEffect(() => {
        loadJobs();
        loadStats();

        // Auto-refresh every 3 seconds (faster for better UX)
        const interval = setInterval(() => {
            loadJobs();
            loadStats();
        }, 3000);

        return () => clearInterval(interval);
    }, []); // Empty dependency array - only run once on mount

    const loadJobs = async () => {
        try {
            const response = await api.get('/social-scraper/jobs');
            setJobs(response.data);
        } catch (error) {
            console.error('Failed to load jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const response = await api.get('/social-scraper/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    const createJob = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Check authentication
            const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
            if (!token) {
                alert('⚠️ Please login first to create scraper jobs');
                router.push('/login');
                return;
            }

            // Create jobs for selected platforms (multi-platform or single)
            const platforms = isMultiPlatform ? selectedPlatforms : [newJob.platform];

            if (platforms.length === 0) {
                alert('Please select at least one platform');
                return;
            }

            // Create jobs in parallel for all selected platforms
            const jobPromises = platforms.map(platform =>
                api.post('/social-scraper/jobs', {
                    ...newJob,
                    platform,
                })
            );

            await Promise.all(jobPromises);

            setShowCreateModal(false);
            setNewJob({
                platform: 'INSTAGRAM',
                keyword: '',
                googlePages: 2,
                replyLimit: 5,
                groqApiKey: '',
            });
            setSelectedPlatforms(['INSTAGRAM']);
            setIsMultiPlatform(false);
            loadJobs();
            loadStats();

            alert(`✅ Successfully created ${platforms.length} scraper job(s)!`);
        } catch (error: any) {
            console.error('Failed to create job:', error);
            console.error('Error details:', error.response?.data);

            // Check if backend is unreachable
            if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
                alert('❌ Backend server is not running!\n\nPlease start the backend server:\n1. Open terminal in backend folder\n2. Run: npm run start:dev');
                return;
            }

            const errorMsg = error.response?.data?.message || error.message || 'Unknown error';

            if (error.response?.status === 401) {
                alert('🔒 Authentication failed. Please login again.');
                router.push('/login');
            } else {
                alert(`❌ Error creating job: ${errorMsg}\n\nStatus Code: ${error.response?.status || 'N/A'}\n\nCheck console for details.`);
            }
        }
    };

    const cancelJob = async (jobId: string) => {
        if (!confirm('Are you sure you want to cancel this job?')) return;

        try {
            await api.post(`/social-scraper/jobs/${jobId}/cancel`);
            loadJobs();
        } catch (error) {
            console.error('Failed to cancel job:', error);
        }
    };

    const deleteJob = async (jobId: string) => {
        if (!confirm('Are you sure you want to delete this job?')) return;

        try {
            await api.delete(`/social-scraper/jobs/${jobId}`);
            loadJobs();
            loadStats();
        } catch (error) {
            console.error('Failed to delete job:', error);
        }
    };

    const getPlatformIcon = (platform: string) => {
        switch (platform) {
            case 'FACEBOOK': return '📘';
            case 'LINKEDIN': return '💼';
            case 'REDDIT': return '🤖';
            case 'TWITTER': return '🐦';
            case 'INSTAGRAM': return '📷';
            case 'TIKTOK': return '🎵';
            default: return '📱';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-gray-100 text-gray-800';
            case 'RUNNING': return 'bg-blue-100 text-blue-800';
            case 'COMPLETED': return 'bg-green-100 text-green-800';
            case 'FAILED': return 'bg-red-100 text-red-800';
            case 'CANCELLED': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#6b8cce] py-8">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                    <div className="text-center md:text-left">
                        <h1 className="text-5xl font-extrabold text-white mb-2 drop-shadow-lg">
                            🔍 Social Scraper
                        </h1>
                        <p className="text-indigo-100 text-lg">Automated Multi-Platform Engagement</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button
                            onClick={async () => {
                                try {
                                    const response = await api.post('/social-scraper/setup-profile');
                                    alert('✅ ' + response.data.message + '\n\n🌐 Chrome will open with login pages.\n📝 Log into all your social media accounts.\n💾 Your sessions will be saved automatically.\n❌ Close Chrome when done.');
                                } catch (error: any) {
                                    alert('❌ Failed to setup Chrome profile: ' + (error.response?.data?.message || error.message));
                                }
                            }}
                            className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-6 py-3 rounded-xl hover:bg-white/30 transition-all font-bold shadow-xl flex items-center gap-2"
                        >
                            🔐 Setup Profiles
                        </button>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-3 rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all font-extrabold shadow-xl transform hover:scale-105"
                        >
                            🚀 New Scraper Job
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                        <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20 transform hover:scale-105 transition-all">
                            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Jobs</h3>
                            <p className="text-4xl font-black text-[#667eea] mt-2">{stats.total}</p>
                        </div>
                        <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20 transform hover:scale-105 transition-all">
                            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Running</h3>
                            <p className="text-4xl font-black text-blue-500 mt-2">{stats.running}</p>
                        </div>
                        <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20 transform hover:scale-105 transition-all">
                            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Comments</h3>
                            <p className="text-4xl font-black text-green-500 mt-2">{stats.totalComments}</p>
                        </div>
                        <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20 transform hover:scale-105 transition-all">
                            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Replies</h3>
                            <p className="text-4xl font-black text-purple-600 mt-2">{stats.totalReplies}</p>
                        </div>
                    </div>
                )}

                {/* Charts Section - Like app.py */}
                {jobs.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <PlatformDistributionChart
                            data={jobs.reduce((acc, job) => {
                                acc[job.platform] = (acc[job.platform] || 0) + job.totalComments;
                                return acc;
                            }, {} as Record<string, number>)}
                            title="📊 Comments by Platform"
                        />
                        <TimeSeriesChart
                            data={jobs.map(job => ({
                                timestamp: job.createdAt,
                                count: job.totalComments
                            })).slice(0, 10)}
                            title="📈 Recent Activity"
                        />
                    </div>
                )}

                {/* Jobs List */}
                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/20">
                    <div className="px-6 py-4 bg-white/50 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">Recent Scraper Jobs</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Platform
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Keyword
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Progress
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Comments
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {jobs.map((job) => (
                                    <tr key={job.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <span className="text-2xl mr-2">{getPlatformIcon(job.platform)}</span>
                                                <span className="text-sm font-medium text-gray-900">{job.platform}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{job.keyword}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(job.status)}`}>
                                                {job.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div
                                                    className="bg-blue-600 h-2.5 rounded-full transition-all"
                                                    style={{ width: `${job.progress}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs text-gray-500">{job.progress}%</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {job.totalComments}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(job.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {job.status === 'RUNNING' && (
                                                <button
                                                    onClick={() => cancelJob(job.id)}
                                                    className="text-yellow-600 hover:text-yellow-900 mr-3"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                            <button
                                                onClick={() => router.push(`/social-scraper/${job.id}`)}
                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={() => deleteJob(job.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Create Job Modal - New Design with Gradient */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                        <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl transform transition-all animate-slideUp">
                            {/* Gradient Header */}
                            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 rounded-t-2xl">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <span className="text-3xl">🚀</span>
                                    Create Scraper Job
                                </h2>
                                <p className="text-indigo-100 text-sm mt-1">Monitor social media mentions and engage automatically</p>
                            </div>

                            <form onSubmit={createJob} className="p-6">
                                {/* Multi-Platform Toggle */}
                                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-purple-200">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isMultiPlatform}
                                            onChange={(e) => setIsMultiPlatform(e.target.checked)}
                                            className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                                        />
                                        <span className="ml-3 text-sm font-semibold text-gray-900">
                                            🌐 Multi-Platform Mode (Parallel Scraping)
                                        </span>
                                    </label>
                                    {isMultiPlatform && (
                                        <p className="text-xs text-gray-800 mt-2 ml-8">
                                            ⚡ Run 4 browsers simultaneously for faster results!
                                        </p>
                                    )}
                                </div>

                                {/* Platform Selection */}
                                {isMultiPlatform ? (
                                    <div className="mb-5">
                                        <label className="block text-sm font-bold text-gray-900 mb-3">
                                            📱 Select Platforms
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { value: 'FACEBOOK', label: 'Facebook', icon: '📘', color: 'blue' },
                                                { value: 'LINKEDIN', label: 'LinkedIn', icon: '💼', color: 'sky' },
                                                { value: 'REDDIT', label: 'Reddit', icon: '🤖', color: 'orange' },
                                                { value: 'TWITTER', label: 'Twitter', icon: '🐦', color: 'cyan' },
                                                { value: 'INSTAGRAM', label: 'Instagram', icon: '📷', color: 'pink' },
                                                { value: 'TIKTOK', label: 'TikTok', icon: '🎵', color: 'purple' },
                                            ].map((platform) => (
                                                <label
                                                    key={platform.value}
                                                    className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${selectedPlatforms.includes(platform.value)
                                                        ? `border-${platform.color}-500 bg-${platform.color}-50`
                                                        : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPlatforms.includes(platform.value)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedPlatforms([...selectedPlatforms, platform.value]);
                                                            } else {
                                                                setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform.value));
                                                            }
                                                        }}
                                                        className="w-4 h-4 text-purple-600 rounded"
                                                    />
                                                    <span className="text-xl">{platform.icon}</span>
                                                    <span className="text-sm font-medium text-gray-900">{platform.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-5">
                                        <label className="block text-sm font-bold text-gray-900 mb-2">
                                            📱 Platform
                                        </label>
                                        <select
                                            value={newJob.platform}
                                            onChange={(e) => setNewJob({ ...newJob, platform: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900"
                                            required
                                        >
                                            <option value="INSTAGRAM">📷 Instagram</option>
                                            <option value="FACEBOOK">📘 Facebook</option>
                                            <option value="LINKEDIN">💼 LinkedIn</option>
                                            <option value="REDDIT">🤖 Reddit</option>
                                            <option value="TWITTER">🐦 Twitter</option>
                                            <option value="TIKTOK">🎵 TikTok</option>
                                        </select>
                                    </div>
                                )}

                                <div className="mb-5">
                                    <label className="block text-sm font-bold text-gray-900 mb-2">
                                        🔍 Keyword
                                    </label>
                                    <input
                                        type="text"
                                        value={newJob.keyword}
                                        onChange={(e) => setNewJob({ ...newJob, keyword: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900"
                                        placeholder="e.g., AI marketing, pizza, fitness"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-5">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">
                                            📄 Google Pages
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={newJob.googlePages}
                                            onChange={(e) => setNewJob({ ...newJob, googlePages: parseInt(e.target.value) || 2 })}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900"
                                            required
                                        />
                                        <span className="text-xs text-gray-500 mt-1">1-10 pages</span>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">
                                            💬 Reply Limit
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="50"
                                            value={newJob.replyLimit}
                                            onChange={(e) => setNewJob({ ...newJob, replyLimit: parseInt(e.target.value) || 5 })}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900"
                                            required
                                        />
                                        <span className="text-xs text-gray-500 mt-1">1-50 replies</span>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-gray-900 mb-2">
                                        🔑 Groq API Key <span className="text-gray-500 font-normal">(optional)</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={newJob.groqApiKey}
                                        onChange={(e) => setNewJob({ ...newJob, groqApiKey: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900"
                                        placeholder="Leave empty to use default key"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Used for AI-powered reply generation</p>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all shadow-xl"
                                    >
                                        🚀 Launch Scraper
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            setIsMultiPlatform(false);
                                            setSelectedPlatforms(['INSTAGRAM']);
                                        }}
                                        className="flex-1 bg-gray-100 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
