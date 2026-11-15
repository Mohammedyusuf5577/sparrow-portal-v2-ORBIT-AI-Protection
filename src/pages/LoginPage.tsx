import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { login as loginApi } from '../api/services';
import { ArrowRight, Zap, Eye, Activity } from 'lucide-react';
import orbitMark from '../assets/images/orbit-mark.png';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await loginApi(email);
            if (response.data.data) {
                login(response.data.data);
                navigate('/admin/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.errorMessage || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-50 flex">
            {/* Left - Brand Section */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-dark relative overflow-hidden">
                {/* Floating shapes */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-orbit-500/20 rounded-full blur-3xl animate-pulse-slow" />
                    <div className="absolute bottom-32 right-16 w-96 h-96 bg-accent-violet/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
                    <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-accent-teal/10 rounded-full blur-2xl animate-pulse-slow" style={{ animationDelay: '3s' }} />
                </div>

                <div className="relative z-10 flex flex-col justify-center px-16 text-white">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-glow overflow-hidden">
                            <img src={orbitMark} alt="ORBIT logo" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">ORBIT</h1>
                            <p className="text-sm text-orbit-200 tracking-wider uppercase font-medium">AI Intelligence Platform</p>
                        </div>
                    </div>

                    <h2 className="text-4xl font-bold leading-tight mb-6">
                        Organizational Risk
                        <br />
                        <span className="bg-gradient-to-r from-orbit-300 to-accent-teal bg-clip-text text-transparent">
                            & Intelligence
                        </span>
                    </h2>

                    <p className="text-lg text-white/70 mb-12 max-w-md leading-relaxed">
                        AI-powered monitoring, risk assessment, and real-time organizational insights for enterprise management.
                    </p>

                    {/* Feature cards */}
                    <div className="space-y-4">
                        {[
                            { icon: Zap, label: 'AI-Powered Risk Detection', desc: 'Proactive anomaly monitoring' },
                            { icon: Eye, label: 'Real-time Oversight', desc: 'Complete organizational visibility' },
                            { icon: Activity, label: 'Smart Analytics', desc: 'Data-driven decision making' },
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-4 p-4 rounded-xl glass-dark animate-slide-up"
                                style={{ animationDelay: `${i * 0.15}s` }}
                            >
                                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                                    <feature.icon className="w-5 h-5 text-orbit-300" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">{feature.label}</p>
                                    <p className="text-xs text-white/50">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md animate-bounce-in">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-10">
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-glow overflow-hidden">
                            <img src={orbitMark} alt="ORBIT logo" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-surface-900">ORBIT</h1>
                            <p className="text-xs text-surface-400 tracking-wider uppercase">AI Intelligence</p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-surface-900 mb-2">Welcome back</h2>
                        <p className="text-surface-500">Sign in to your admin dashboard</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-2">
                                Email Address
                            </label>
                            <input
                                id="email-input"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@orbit.com"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-white text-surface-900
                  placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-orbit-500/30
                  focus:border-orbit-500 transition-all duration-200"
                            />
                        </div>

                        {error && (
                            <div className="p-3 rounded-xl bg-accent-rose/10 border border-accent-rose/20 animate-fade-in">
                                <p className="text-sm text-accent-rose font-medium">{error}</p>
                            </div>
                        )}

                        <button
                            id="login-button"
                            type="submit"
                            disabled={loading || !email}
                            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl
                bg-gradient-orbit text-white font-semibold text-sm
                hover:shadow-glow hover:scale-[1.02] active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                transition-all duration-200"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Sign in to ORBIT
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 p-4 rounded-xl bg-orbit-50/50 border border-orbit-100">
                        <p className="text-xs text-orbit-600 font-medium mb-1">Demo Credentials</p>
                        <p className="text-xs text-surface-500">Email: <code className="text-orbit-700 font-mono bg-orbit-100 px-1.5 py-0.5 rounded">admin@orbit.com</code></p>
                    </div>

                    <p className="mt-6 text-center text-xs text-surface-400">
                        ORBIT v1.0.0 • AI Based Organizational Risk & Intelligence
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
