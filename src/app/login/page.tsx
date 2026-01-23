'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/login', {
                email,
                password,
            });

            // Store the token
            localStorage.setItem('auth_token', response.data.access_token);
            localStorage.setItem('token', response.data.access_token);

            // Redirect to social scraper
            router.push('/social-scraper');
        } catch (err: any) {
            console.error('Login failed:', err);
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-slideUp">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="text-5xl mb-4">🚀</div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        AI Marketing Agency
                    </h1>
                    <p className="text-gray-600 mt-2">Sign in to access Social Scraper</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        ⚠️ {error}
                    </div>
                )}

                {/* Demo Credentials */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900 mb-2">🎯 Demo Credentials:</p>
                    <p className="text-xs text-blue-700">Email: <strong>admin@ai-marketing.com</strong></p>
                    <p className="text-xs text-blue-700">Password: <strong>admin123</strong></p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin}>
                    <div className="mb-5">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            📧 Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            placeholder="your@email.com"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            🔒 Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? '⏳ Signing in...' : '🚀 Sign In'}
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-6 text-center text-sm text-gray-600">
                    <p>Don't have an account? Contact your administrator.</p>
                </div>
            </div>
        </div>
    );
}
