'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { PlatformDistributionChart, TimeSeriesChart, TimeDistributionChart } from '@/components/charts/ScraperCharts';
import { MessageSquare, Users, Clock, Send, Globe, ChevronLeft } from 'lucide-react';

interface Comment {
    id: string;
    username: string;
    comment: string;
    postUrl: string;
    timePosted?: string;
    reply?: {
        id: string;
        replyText: string;
        status: string;
        repliedAt?: string;
    };
}

interface Job {
    id: string;
    platform: string;
    keyword: string;
    status: string;
    progress: number;
    totalComments: number;
    totalReplies: number;
    googlePages: number;
    replyLimit: number;
    createdAt: string;
    startedAt?: string;
    completedAt?: string;
    errorMessage?: string;
    comments: Comment[];
}

export default function JobDetailPage() {
    const router = useRouter();
    const params = useParams();
    const jobId = params.id as string;

    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadJob();

        // Auto-refresh if job is running
        const interval = setInterval(() => {
            if (job?.status === 'RUNNING') {
                loadJob();
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [jobId, job?.status]);

    const loadJob = async () => {
        try {
            const response = await api.get(`/social-scraper/jobs/${jobId}`);
            setJob(response.data);
        } catch (error) {
            console.error('Failed to load job:', error);
            alert('Failed to load job');
            router.push('/social-scraper');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'RUNNING': return 'bg-blue-100 text-blue-800';
            case 'COMPLETED': return 'bg-green-100 text-green-800';
            case 'FAILED': return 'bg-red-100 text-red-800';
            case 'CANCELLED': return 'bg-gray-100 text-gray-800';
            case 'SENT': return 'bg-green-100 text-green-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    const parseTimeStr = (timeStr: string): number => {
        if (!timeStr) return 999;
        const num = parseInt(timeStr);
        if (isNaN(num)) return 999;
        if (timeStr.includes('h')) return num;
        if (timeStr.includes('d')) return num * 24;
        if (timeStr.includes('m')) return num / 60;
        if (timeStr.includes('w')) return num * 24 * 7;
        if (timeStr.includes('y')) return num * 24 * 365;
        return num;
    };

    const analytics = {
        h1: job?.comments.filter(c => parseTimeStr(c.timePosted || '') <= 1).length || 0,
        h6: job?.comments.filter(c => {
            const h = parseTimeStr(c.timePosted || '');
            return h > 1 && h <= 6;
        }).length || 0,
        h24: job?.comments.filter(c => {
            const h = parseTimeStr(c.timePosted || '');
            return h > 6 && h <= 24;
        }).length || 0,
        d7: job?.comments.filter(c => {
            const h = parseTimeStr(c.timePosted || '');
            return h > 24 && h <= 168;
        }).length || 0,
        older: job?.comments.filter(c => parseTimeStr(c.timePosted || '') > 168).length || 0,
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2]">
                <div className="text-center bg-white/20 backdrop-blur-lg p-10 rounded-3xl shadow-2xl border border-white/30">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mx-auto"></div>
                    <p className="mt-6 text-white text-xl font-bold">Synchronizing Engine...</p>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="container mx-auto px-4 py-8">
                <p>Job not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#6b8cce] py-8">
            <div className="container mx-auto px-4">
                <button
                    onClick={() => router.push('/social-scraper')}
                    className="mb-8 text-white/80 hover:text-white flex items-center gap-2 transform transition-transform hover:-translate-x-1 font-bold"
                >
                    <ChevronLeft size={20} /> Back to Dashboard
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Premium Header Card */}
                        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Globe size={120} />
                            </div>

                            <div className="flex justify-between items-start relative z-10">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-4xl text-blue-600">
                                            {job.platform === 'FACEBOOK' ? '📘' : job.platform === 'LINKEDIN' ? '💼' : job.platform === 'REDDIT' ? '🤖' : job.platform === 'TWITTER' ? '🐦' : job.platform === 'INSTAGRAM' ? '📷' : '📱'}
                                        </span>
                                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                                            {job.platform} Analysis
                                        </h1>
                                    </div>
                                    <p className="text-gray-600 text-lg">Scanning Keyword: <span className="text-purple-600 font-bold px-3 py-1 bg-purple-50 rounded-full ml-1">{job.keyword}</span></p>
                                </div>
                                <span className={`px-5 py-2 inline-flex text-sm leading-5 font-black uppercase tracking-widest rounded-full shadow-lg ${getStatusColor(job.status)}`}>
                                    {job.status}
                                </span>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
                                <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100/50">
                                    <p className="text-xs font-black text-blue-600 uppercase tracking-wider mb-2">Comments Found</p>
                                    <p className="text-4xl font-black text-blue-900">{job.totalComments}</p>
                                </div>
                                <div className="bg-purple-50/50 p-5 rounded-2xl border border-purple-100/50">
                                    <p className="text-xs font-black text-purple-600 uppercase tracking-wider mb-2">Replies Sent</p>
                                    <p className="text-4xl font-black text-purple-900">{job.totalReplies}</p>
                                </div>
                                <div className="bg-green-50/50 p-5 rounded-2xl border border-green-100/50">
                                    <p className="text-xs font-black text-green-600 uppercase tracking-wider mb-2">Google Pages</p>
                                    <p className="text-4xl font-black text-green-900">{job.googlePages}</p>
                                </div>
                                <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100/50">
                                    <p className="text-xs font-black text-orange-600 uppercase tracking-wider mb-2">Limit</p>
                                    <p className="text-4xl font-black text-orange-900">{job.replyLimit}</p>
                                </div>
                            </div>

                            {/* Job Progress */}
                            {job.status === 'RUNNING' && (
                                <div className="mt-10">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-sm font-bold text-gray-700">Scraping Progress</span>
                                        <span className="text-sm font-black text-indigo-600">{job.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-5 p-1 shadow-inner">
                                        <div
                                            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-1000 shadow-lg"
                                            style={{ width: `${job.progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Analytics Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <TimeDistributionChart
                                data={{
                                    '< 1h': analytics.h1,
                                    '1-6h': analytics.h6,
                                    '6-24h': analytics.h24,
                                    '1-7d': analytics.d7,
                                    'Older': analytics.older
                                }}
                                title="🕒 Engagement by Age"
                            />
                            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl p-8 border border-white/20">
                                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 mb-6 flex items-center gap-2">
                                    <Clock size={24} className="text-blue-600" />
                                    Job Timeline
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                        <span className="text-gray-500 font-bold">Created</span>
                                        <span className="text-gray-900 font-black">{new Date(job.createdAt).toLocaleString()}</span>
                                    </div>
                                    {job.startedAt && (
                                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                            <span className="text-gray-500 font-bold">Started</span>
                                            <span className="text-indigo-600 font-black">{new Date(job.startedAt).toLocaleString()}</span>
                                        </div>
                                    )}
                                    {job.completedAt && (
                                        <div className="flex justify-between items-center py-3">
                                            <span className="text-gray-500 font-bold">Finished</span>
                                            <span className="text-green-600 font-black">{new Date(job.completedAt).toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Comments Explorer */}
                        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20">
                            <div className="px-8 py-6 bg-white/50 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                    <MessageSquare size={28} className="text-indigo-600" />
                                    Recent Mentions ({job.comments?.length || 0})
                                </h2>
                            </div>

                            <div className="divide-y divide-gray-100 max-h-[800px] overflow-y-auto custom-scrollbar">
                                {job.comments && job.comments.length > 0 ? (
                                    job.comments.map((comment) => (
                                        <div key={comment.id} className="p-8 hover:bg-white/50 transition-colors group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <p className="text-xl font-black text-gray-900 tracking-tight">@{comment.username}</p>
                                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded uppercase">Active User</span>
                                                    </div>
                                                    <p className="text-gray-700 leading-relaxed text-lg italic bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                                        "{comment.comment}"
                                                    </p>
                                                </div>
                                                {comment.timePosted && (
                                                    <div className="text-right ml-4">
                                                        <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-black whitespace-nowrap">
                                                            {comment.timePosted}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <a
                                                    href={comment.postUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-4 py-2 rounded-xl border border-blue-100"
                                                >
                                                    <Globe size={16} /> Source Post
                                                </a>
                                                {comment.reply && (
                                                    <span className="text-sm font-black text-purple-600 bg-purple-50 px-4 py-2 rounded-xl border border-purple-100 flex items-center gap-2">
                                                        <Send size={16} /> Engaged ✅
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-20 text-center">
                                        <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <MessageSquare size={40} className="text-gray-400" />
                                        </div>
                                        <p className="text-gray-500 text-xl font-bold italic">No mentions found yet...</p>
                                        <p className="text-gray-400 mt-2">Engage the scraper to start collecting data.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Engagement Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 sticky top-8 overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
                                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                    <Send size={24} />
                                    Engagement Monitor
                                </h2>
                                <p className="text-purple-100 font-bold mt-1">Real-time AI Autopilot Log</p>
                            </div>

                            <div className="p-6 space-y-6 max-h-[1000px] overflow-y-auto">
                                {job.comments.filter(c => c.reply).length > 0 ? (
                                    job.comments.filter(c => c.reply).reverse().map((comment) => (
                                        <div key={`reply-${comment.id}`} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-3xl p-6 shadow-md hover:shadow-xl transition-shadow relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-2 h-full bg-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black">
                                                    {comment.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 tracking-tight">@{comment.username}</p>
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                                        {comment.reply?.repliedAt ? new Date(comment.reply.repliedAt).toLocaleTimeString() : 'Recently'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="bg-indigo-600/5 p-4 rounded-2xl border border-indigo-100 mb-4">
                                                <p className="text-xs font-black text-indigo-600 uppercase mb-2">AI Response Generated</p>
                                                <p className="text-gray-800 font-bold leading-relaxed">
                                                    "{comment.reply?.replyText}"
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className={`px-4 py-1.5 text-[11px] font-black rounded-full uppercase tracking-tighter shadow-sm border ${comment.reply?.status === 'SENT'
                                                    ? 'bg-green-100 text-green-700 border-green-200'
                                                    : 'bg-red-100 text-red-700 border-red-200'
                                                    }`}>
                                                    {comment.reply?.status === 'SENT' ? 'Autopilot Engaged ✅' : 'Engagement Failed ❌'}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-20 opacity-40">
                                        <Users size={60} className="mx-auto text-gray-300 mb-4" />
                                        <p className="text-gray-400 font-black tracking-widest uppercase">Waiting for replies...</p>
                                    </div>
                                )}
                            </div>

                            {/* Sidebar Footer Metric */}
                            <div className="p-6 bg-indigo-50 border-t border-indigo-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-indigo-600 font-black text-sm uppercase">Total Engagement</span>
                                    <span className="text-2xl font-black text-indigo-900">{job.totalReplies}</span>
                                </div>
                                <div className="mt-4 p-4 bg-white rounded-2xl shadow-inner text-center">
                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Conversion Potential</p>
                                    <p className="text-2xl font-black text-gray-900">{(job.totalReplies * 1.5).toFixed(1)}%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
